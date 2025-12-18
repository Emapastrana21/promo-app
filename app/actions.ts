'use server'

import { prisma } from "./lib/db"
import { revalidatePath } from "next/cache"
// import { redirect } from "next/navigation" // 👈 Lo comentamos para que no de error falso
import { v2 as cloudinary } from 'cloudinary'
import { auth } from "@/auth"
import * as cheerio from 'cheerio';
import webpush from 'web-push'; 
import { hash } from "bcryptjs"; 

// --- 👮‍♂️ ZONA DE ADMINS ---
const ADMINS = ["emapastri@gmail.com"]; 

function esAdmin(email: string | null | undefined) {
    return email && ADMINS.includes(email);
}

// --- CONFIGURACIONES ---
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:test@test.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
}

// --- FUNCIONES ---

export async function crearOferta(formData: FormData) {
  const session = await auth();
  const userEmail = session?.user?.email;

  const title = (formData.get("title") as string) || "Sin título";
  const priceInput = formData.get("price") as string;
  const price = priceInput ? parseFloat(priceInput) : 0;
  const storeName = (formData.get("store") as string) || "Tienda Genérica";
  const categoryName = (formData.get("category") as string) || "Varios";
  const link = formData.get("link") as string;
  
  const paymentsRaw = formData.getAll("payments") as string[]; 
  
  const imageLink = formData.get("imageLink") as string;
  const imageFile = formData.get("image") as File;
  let finalImageUrl = null;

  if (imageFile && imageFile.size > 0) {
    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "ofertas_app" }, (error, result) => {
            if (error) reject(error); else resolve(result);
        }).end(buffer);
      }) as any;
      finalImageUrl = uploadResult.secure_url;
    } catch (error) { console.error("Error Cloudinary:", error); }
  } else if (imageLink && imageLink.length > 0) {
      finalImageUrl = imageLink;
  }

  const categorySlug = categoryName.toLowerCase().trim().replace(/ /g, '-')
  let category = await prisma.categories.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    category = await prisma.categories.create({ data: { name: categoryName, slug: categorySlug } });
  }

  let store = await prisma.stores.findFirst({ where: { name: storeName } });
  if (!store) {
    store = await prisma.stores.create({ data: { name: storeName } });
  }

  try {
      await prisma.offers.create({
        data: {
          title,
          price,
          image_url: finalImageUrl,
          link: link || null,
          categories: { connect: { id: category.id } },
          stores: { connect: { id: store.id } },
          users: userEmail ? { connect: { email: userEmail } } : undefined,
          
          paymentMethods: {
            connectOrCreate: paymentsRaw.map(p => ({
                where: { name: p },
                create: { name: p, slug: p.toLowerCase().trim().replace(/ /g, '-') }
            }))
          }
        }
      });
  } catch (error) { 
      console.error("Error Prisma:", error); 
      throw error; 
  }

  revalidatePath("/");
  // redirect("/"); 👈 ESTO ERA EL CULPABLE DEL ERROR ROJO
  return { success: true }; // Ahora devolvemos "éxito" limpio
}

export async function votar(idOferta: string) {
  await prisma.offers.update({
    where: { id: idOferta },
    data: { votes_count: { increment: 1 } }
  })
  revalidatePath("/")
}

export async function obtenerDatosDelLink(url: string) {
  "use server";
  if (!url) return { error: "Link vacío" };
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0...' } });
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    return { title, image };
  } catch (error) { return { error: "Error scrapeando" }; }
}

export async function comentarOferta(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.email) throw new Error("Debes iniciar sesión");
  const text = formData.get("text") as string;
  const offerId = formData.get("offerId") as string;
  if (!text || text.trim().length === 0) return;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return;
  await prisma.comment.create({
    data: { text, offerId, userId: user.id }
  });
  revalidatePath(`/oferta/${offerId}`);
}

export async function toggleFavorite(offerId: string) {
  "use server";
  const session = await auth();
  if (!session?.user?.email) throw new Error("Debes iniciar sesión");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return;
  const existing = await prisma.favorite.findUnique({
    where: { userId_offerId: { userId: user.id, offerId } }
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/"); revalidatePath(`/oferta/${offerId}`); revalidatePath("/perfil");
    return { added: false };
  } else {
    await prisma.favorite.create({ data: { userId: user.id, offerId } });
    revalidatePath("/"); revalidatePath(`/oferta/${offerId}`); revalidatePath("/perfil");
    return { added: true };
  }
}

// --- FUNCIONES SEGURAS ---

export async function borrarOferta(formData: FormData) {
  "use server";
  const session = await auth();
  const id = formData.get("id") as string;
  if (!session?.user?.email) throw new Error("No autorizado");
  const oferta = await prisma.offers.findUnique({ where: { id }, include: { users: true } });
  if (!oferta) return;
  const soyDueño = oferta.users?.email === session.user.email;
  const soyAdmin = esAdmin(session.user.email);
  if (!soyDueño && !soyAdmin) throw new Error("No autorizado");
  await prisma.offers.delete({ where: { id } });
  revalidatePath("/");
  // redirect("/"); // Comentado también por si acaso
  return { success: true };
}

export async function actualizarOferta(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");
  const id = formData.get("id") as string;
  const oferta = await prisma.offers.findUnique({ where: { id }, include: { users: true } });
  if (!oferta) throw new Error("No encontrada");
  const soyDueño = oferta.users?.email === session.user.email;
  const soyAdmin = esAdmin(session.user.email);
  if (!soyDueño && !soyAdmin) throw new Error("No autorizado");
  
  const title = formData.get("title") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const storeName = formData.get("store") as string;
  const categoryName = formData.get("category") as string;
  const link = formData.get("link") as string;

  const categorySlug = categoryName.toLowerCase().trim().replace(/ /g, '-');
  let category = await prisma.categories.findUnique({ where: { slug: categorySlug } });
  if (!category) category = await prisma.categories.create({ data: { name: categoryName, slug: categorySlug } });
  let store = await prisma.stores.findFirst({ where: { name: storeName } });
  if (!store) store = await prisma.stores.create({ data: { name: storeName } });

  await prisma.offers.update({
    where: { id },
    data: {
      title, price, link: link || null,
      categories: { connect: { id: category.id } },
      stores: { connect: { id: store.id } }
    }
  });
  revalidatePath("/"); revalidatePath(`/oferta/${id}`); 
  return { success: true };
}

export async function alternarStock(formData: FormData) {
  "use server";
  const session = await auth();
  const id = formData.get("id") as string;
  const nuevoEstado = formData.get("nuevoEstado") as string;
  if (!session?.user?.email) throw new Error("No autorizado");
  const oferta = await prisma.offers.findUnique({ where: { id }, include: { users: true } });
  if (!oferta) throw new Error("No existe");
  const soyDueño = oferta.users?.email === session.user.email;
  const soyAdmin = esAdmin(session.user.email);
  if (!soyDueño && !soyAdmin) throw new Error("No autorizado");
  await prisma.offers.update({
    where: { id },
    data: { status: nuevoEstado === 'expired' ? 'expired' : 'active' }
  });
  revalidatePath("/"); revalidatePath(`/oferta/${id}`);
}

// --- NOTIFICACIONES ---

export async function suscribirseNotificaciones(subscription: any) {
    "use server";
    const session = await auth();
    try {
        await prisma.pushSubscription.create({
            data: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: session?.user ? (await prisma.user.findUnique({where: {email: session.user.email!}}))?.id : null
            }
        });
        return { success: true };
    } catch (error) {
        return { success: true }; 
    }
}

export async function enviarAlertaMasiva(mensaje: string, url: string = "/") {
    "use server";
    const session = await auth();
    
    if (!esAdmin(session?.user?.email)) {
        throw new Error("No tenés permiso para enviar alertas.");
    }

    const suscripciones = await prisma.pushSubscription.findMany();

    const payload = JSON.stringify({
        title: "🔥 ¡Alerta de Oferta!",
        body: mensaje,
        url: url,
        icon: "/icon.png"
    });

    const promesas = suscripciones.map(sub => {
        const pushConfig = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        return webpush.sendNotification(pushConfig, payload).catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
                prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(()=>{});
            }
        });
    });

    await Promise.all(promesas);
    return { enviados: suscripciones.length };
}


// --- REPORTAR STOCK (WAZE) ---
export async function reportarStock(offerId: string, status: 'YES' | 'NO') {
  "use server";
  const session = await auth();
  
  if (!session?.user?.email) throw new Error("Debes iniciar sesión para reportar");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return;

  const existing = await prisma.stockReport.findUnique({
    where: {
      userId_offerId: {
        userId: user.id,
        offerId
      }
    }
  });

  if (existing) {
    await prisma.stockReport.update({
      where: { id: existing.id },
      data: { status }
    });
  } else {
    await prisma.stockReport.create({
      data: { status, offerId, userId: user.id }
    });
  }

  if (status === 'NO') {
      const reportesNegativos = await prisma.stockReport.count({
          where: { offerId, status: 'NO' }
      });
      
      if (reportesNegativos >= 5) {
          await prisma.offers.update({
            where: { id: offerId },
            data: { status: 'expired' }
          });
      }
  }

  revalidatePath(`/oferta/${offerId}`);
}

// --- DENUNCIAR OFERTA 🚩 ---
export async function denunciarOferta(offerId: string, reason: string) {
  "use server";
  const session = await auth();
  
  if (!session?.user?.email) throw new Error("Debes iniciar sesión para denunciar");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return;

  try {
      await prisma.report.create({
        data: {
            offerId,
            userId: user.id,
            reason
        }
      });
  } catch (e) {
      return { error: "Ya denunciaste esta oferta" };
  }

  const totalReportes = await prisma.report.count({
      where: { offerId }
  });

  if (totalReportes >= 5) {
      await prisma.offers.update({
          where: { id: offerId },
          data: { status: 'rejected' }
      });
  }

  revalidatePath(`/oferta/${offerId}`);
  return { success: true };
}

// --- ACTUALIZAR PERFIL ---
export async function actualizarPerfil(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autorizado");

  const location = formData.get("location") as string;
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { location }
  });

  revalidatePath("/configuracion");
  revalidatePath("/perfil");
}

// --- REGISTRAR USUARIO ---
export async function registrarUsuario(formData: FormData) {
  "use server";
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
      return { error: "Faltan datos completos." };
  }

  const existe = await prisma.user.findUnique({
      where: { email }
  });

  if (existe) {
      return { error: "Este email ya está registrado. Probá iniciar sesión." };
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
      data: {
          name,
          email,
          password: hashedPassword,
          image: null, 
          role: 'user'
      }
  });

  return { success: true };
}
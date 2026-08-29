// Sekali jalan: memindahkan form kategori acara lama ke kategori bawaannya.
//
// Kategori acara dulu satu template bernama `event`. Sejak katalog dipecah per
// kategori yang diselenggarakan, form lama tidak lagi cocok dengan kategori
// mana pun sehingga tidak tampil di beranda. Skrip ini hanya mengganti
// templateId — tidak ada form maupun jawaban yang dihapus.
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FROM_TEMPLATE_ID = 'event'
const TO_TEMPLATE_ID = 'event-tech'

const main = async () => {
  const affected = await prisma.form.findMany({
    where: { templateId: FROM_TEMPLATE_ID },
    select: { id: true, title: true },
  })

  if (!affected.length) {
    console.log(`• tidak ada form ber-templateId "${FROM_TEMPLATE_ID}"`)
    return
  }

  const { count } = await prisma.form.updateMany({
    where: { templateId: FROM_TEMPLATE_ID },
    data: { templateId: TO_TEMPLATE_ID },
  })

  console.log(`• ${count} form dipindah ke "${TO_TEMPLATE_ID}":`)
  affected.forEach((form) => console.log(`  - ${form.title}`))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChefHat, Receipt, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LoadData } from '@/shared/components/load-data'

export interface ResponsesOrderItem {
  name: string
  qty: number
  price: number
  subtotal: number
}

interface Props {
  formId: string
  title: string
  image: string
  name: string
  items: ResponsesOrderItem[]
  amount: number
  paymentMethod: string
}

export default function ResponsesOrder({
  formId,
  title,
  image,
  name,
  items,
  amount,
  paymentMethod,
}: Props) {
  const data = useMemo(() => {
    const getCurrencyText = (value: number) =>
      `Rp${value.toLocaleString('id-ID')}`

    const getMappedItem = (item: ResponsesOrderItem) => ({
      name: item.name,
      qtyText: `${String(item.qty).padStart(2, '0')} × ${getCurrencyText(item.price)}`,
      subtotalText: getCurrencyText(item.subtotal),
    })

    const mappedList = items.map((raw) => getMappedItem(raw))

    return {
      data: mappedList,
      isLoading: false,
      isError: false,
      isEmpty: !mappedList.length,
      emptyTitle: 'Tidak Ada Item',
      emptySubtitle: 'Pesanan ini tersimpan tanpa item menu.',
      emptyImage: '/no-data.svg',
      pagination: { currentPage: 1, perPage: mappedList.length },
      title,
      image,
      amountText: getCurrencyText(amount),
      paymentMethod: paymentMethod || 'Belum dipilih',
      orderName: name.trim() || 'Pemesan',
      totalItem: items.reduce((total, item) => total + item.qty, 0),
    }
  }, [title, image, name, items, amount, paymentMethod])

  return (
    <div className="border-2 border-foreground">
      {data.image ? (
        <div className="border-b-2 border-foreground bg-muted">
          <Image
            src={data.image}
            alt={`Banner ${data.title}`}
            width={0}
            height={0}
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="border-b-2 border-foreground bg-primary px-5 py-9 text-primary-foreground sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="brutal-eyebrow flex items-center gap-2 bg-foreground px-3 py-2 text-primary">
            <Receipt className="h-3.5 w-3.5" /> PESANAN MASUK
          </span>
          <span
            aria-hidden
            className="brutal-hatch hidden flex-1 opacity-30 sm:block"
          />
          <span className="brutal-eyebrow flex items-center gap-2">
            <ChefHat className="h-3.5 w-3.5" />
            {String(data.totalItem).padStart(2, '0')} ITEM
          </span>
        </div>

        <h1 className="mt-6 break-words font-display text-[clamp(1.9rem,5.5vw,3.25rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          {data.title}
        </h1>

        <p className="mt-5 font-mono text-sm leading-relaxed">
          Atas nama <span className="font-bold">{data.orderName}</span>. Tunjukkan
          halaman ini ke pelayan sebagai bukti pesanan.
        </p>
      </div>

      <LoadData
        response={data}
        className="border-b-2 border-foreground bg-paper"
      >
        <ul>
          {data.data.map((item) => (
            <li
              key={item.name}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-foreground px-5 py-4 last:border-b-0 sm:px-7"
            >
              <span className="min-w-0 break-words font-display text-base font-black uppercase leading-tight tracking-tight">
                {item.name}
              </span>
              <span className="brutal-eyebrow text-muted-foreground">
                {item.qtyText}
              </span>
              <span className="brutal-eyebrow shrink-0">
                {item.subtotalText}
              </span>
            </li>
          ))}
        </ul>
      </LoadData>

      <dl className="grid border-b-2 border-foreground bg-foreground text-background sm:grid-cols-2">
        <div className="border-b-2 border-foreground px-5 py-5 sm:border-b-0 sm:border-r-2 sm:px-7">
          <dt className="brutal-eyebrow flex items-center gap-2 opacity-70">
            <Wallet className="h-3.5 w-3.5" /> METODE PEMBAYARAN
          </dt>
          <dd className="mt-2.5 break-words font-display text-lg font-black uppercase leading-tight tracking-tight">
            {data.paymentMethod}
          </dd>
        </div>
        <div className="px-5 py-5 sm:px-7">
          <dt className="brutal-eyebrow opacity-70">TOTAL TAGIHAN</dt>
          <dd className="mt-2.5 font-display text-3xl font-black leading-none">
            {data.amountText}
          </dd>
        </div>
      </dl>

      <div className="border-b-2 border-foreground bg-muted px-5 py-6 sm:px-7">
        <p className="brutal-eyebrow text-muted-foreground">STATUS PEMBAYARAN</p>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
          Pesanan dicatat sebagai menunggu konfirmasi. Petugas mencocokkan
          pembayaranmu dari daftar pesanan, lalu meneruskannya ke dapur.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-5 bg-paper px-5 py-7 sm:px-7">
        <Button asChild size="lg">
          <Link href={`/forms/${formId}/result`}>Lihat Daftar Pesanan</Link>
        </Button>
        <Button asChild variant="danger" size="sm">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  )
}

# Panduan Pengelolaan Komponen

Dokumen ini berisi teknis pengelolaan komponen di dalam direktori `src/shared/components/`.

## 📁 Struktur Komponen

```
src/shared/components/
├── base/       # Komponen UI dasar (button, input, dll)
├── features/   # Komponen khusus fitur (GeneratorSidebar, dll)
└── reusable/   # Komponen yang dapat digunakan di banyak halaman
```

## 🛠️ Aturan Pengembangan

### Struktur Kode React
Setiap komponen mengikuti pola standar Functional Component:

```tsx
import React, { useState, useEffect, useMemo } from 'react'

// 1. Definisi Interface Props
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

// 2. Definisi Komponen
export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  // 3. State
  const [data, setData] = useState([])

  // 4. Memo/Computed
  const uppercaseTitle = useMemo(() => title.toUpperCase(), [title])

  // 5. Metode/Functions
  const handleAction = () => {
    if (onClick) onClick()
  }

  // 6. Effects (Lifecycle)
  useEffect(() => {
    // onMounted logic
    return () => {
      // onUnmounted logic
    }
  }, [])

  return (
    <div className="component-wrapper">
      <h1>{uppercaseTitle}</h1>
      <button onClick={handleAction}>Click Me</button>
    </div>
  )
}
```

### Aturan Kode Penting
1. **Hooks & Logic Separation:** Gunakan custom hooks jika logika komponen terlalu panjang (lebih dari 100 baris).
2. **Prop Destructuring:** Selalu lakukan destructuring pada props untuk kejelasan data yang digunakan.
3. **Component Sectioning:** Jika sebuah komponen memiliki sub-bagian yang kompleks, pecahlah menjadi komponen-komponen kecil di dalam folder yang sama.
4. **Attribute Formatting:** Gunakan satu attribute per baris jika jumlah attribute lebih dari 2 untuk meningkatkan keterbacaan.

```tsx
<Button
  variant="primary"
  size="lg"
  onClick={handleClick}
  className="mt-4"
>
  Submit
</Button>
```

### Pengelolaan SCSS
Gunakan file SCSS terpisah dan import di bagian atas file komponen.

**Aturan Penulisan SCSS:**
1. **Lokasi File:** `src/shared/components/{folder}/{NamaKomponen}.scss`
2. **Import Komponen:** Lakukan import langsung di file `.tsx` atau `.tsx`.

```tsx
import './MyComponent.scss'
```

## 🧊 Pengelolaan Data Statis
Pisahkan data statis (non-reactive) ke dalam folder `static` di setiap fitur:
- **Lokasi:** `src/shared/components/features/{nama_fitur}/static/{NamaComponent}.ts`
- **Tujuan:** Memisahkan data (seperti konfigurasi tabel, opsi dropdown statis) dari file logika utama.
- **Kriteria:** Hanya berisi `export const`, dilarang menggunakan hooks atau API calls di dalam file ini.
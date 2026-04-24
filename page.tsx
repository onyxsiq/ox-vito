'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { useCart, Product } from '../../context/CartContext';

const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!;
const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!;

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Products/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) throw new Error('Product not found');
        const record = await response.json();
        
        // Handle colors (could be comma separated string or array)
        const colorsRaw = record.fields.Colors;
        const colors = Array.isArray(colorsRaw) 
          ? colorsRaw 
          : (typeof colorsRaw === 'string' ? colorsRaw.split(',').map(s => s.trim()) : []);

        // Handle variant images
        const variantImages = Array.isArray(record.fields.VariantImages)
          ? record.fields.VariantImages.map((img: any) => img.url)
          : [];

        setProduct({
          id: record.id,
          name: record.fields.Name,
          price: record.fields.Price,
          description: record.fields.Description,
          image:
            Array.isArray(record.fields.Image) && record.fields.Image.length > 0
              ? record.fields.Image[0].url
              : `https://placehold.co/800x900?text=${record.fields.Name || 'Product'}`,
          category: record.fields.Category || 'General',
          colors: colors,
          variantImages: variantImages
        });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const itemToAdd = {
      ...product,
      selectedColor: product.colors?.[selectedColorIndex]
    };
    addToCart(itemToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
          <p className="text-2xl font-serif text-gray-700">Product not found.</p>
          <Link href="/" className="text-gray-900 underline hover:text-gray-600">← Back to store</Link>
        </div>
      </div>
    );
  }

  const currentImage = product.variantImages?.[selectedColorIndex] || product.image;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px] font-bold">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">{product.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-bold uppercase tracking-widest text-[10px]">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl bg-gray-100">
            <img
              key={currentImage}
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-sm">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center py-8 lg:py-0 lg:sticky lg:top-32">
            <h1 className="text-5xl font-serif font-bold text-gray-900 leading-tight mb-4 tracking-tighter">
              {product.name}
            </h1>

            <p className="text-4xl font-serif text-gray-800 mb-8 font-light">
              ${product.price}
            </p>

            <div className="w-16 h-px bg-gray-200 mb-8"></div>

            <p className="text-gray-500 leading-relaxed text-lg mb-10 font-light">
              {product.description || 'A premium quality piece from the OX VITO collection, designed for style and comfort.'}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Select Color: <span className="text-gray-900">{product.colors[selectedColorIndex]}</span>
                </h3>
                <div className="flex gap-3">
                  {product.colors.map((color, idx) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-300 relative ${
                        selectedColorIndex === idx 
                          ? 'border-gray-900 scale-110 shadow-lg' 
                          : 'border-transparent hover:border-gray-200'
                      }`}
                      title={color}
                    >
                      <span 
                        className="absolute inset-1 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-5 px-8 rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white hover:bg-black hover:shadow-2xl active:scale-95'
              }`}
            >
              {added ? 'Added to Bag' : 'Add to Bag'}
            </button>

            <Link
              href="/"
              className="mt-6 text-center text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold font-serif mb-4">OX Vito</h3>
          <p className="text-gray-400 mb-6">Premium clothing for the modern individual</p>
          <p className="text-sm text-gray-500">© 2026 OX Vito. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

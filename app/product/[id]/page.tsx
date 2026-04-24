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
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Products/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) throw new Error('Product not found');
        const record = await response.json();
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
    addToCart(product);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center py-8 lg:py-0 lg:sticky lg:top-32">
            <h1 className="text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-4xl font-serif text-gray-800 mb-8">
              ${product.price}
            </p>

            <div className="w-16 h-px bg-gray-300 mb-8"></div>

            <p className="text-gray-600 leading-relaxed text-lg mb-10">
              {product.description || 'A premium quality piece from the OX Vito collection, designed for style and comfort.'}
            </p>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-5 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                added
                  ? 'bg-green-600 text-white scale-95'
                  : 'bg-gray-900 text-white hover:bg-gray-700 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
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

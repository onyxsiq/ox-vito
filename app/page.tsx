'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import { useCart, Product } from './context/CartContext';

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!;
        const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!;
        const tableName = 'Products';

        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        const fetchedProducts: Product[] = data.records.map((record: any) => ({
          id: record.id,
          name: record.fields.Name,
          price: record.fields.Price,
          description: record.fields.Description,
          image: Array.isArray(record.fields.Image) && record.fields.Image.length > 0 
            ? record.fields.Image[0].url 
            : (typeof record.fields.Image === 'string' ? record.fields.Image : `https://placehold.co/600x400?text=${record.fields.Category || 'Product'}`),
          category: record.fields.Category || 'T-Shirts',
        }));

        setProducts(fetchedProducts);
        const uniqueCategories = Array.from(new Set(fetchedProducts.map(p => p.category)));
        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching products:', error);
        // For demo, use placeholder data
        setProducts([
          {
            id: '1',
            name: 'Classic T-Shirt',
            price: 25,
            description: 'Comfortable cotton t-shirt',
            image: 'https://placehold.co/300x200?text=T-Shirt',
            category: 'T-Shirts',
          },
          {
            id: '2',
            name: 'Slim Fit Pants',
            price: 45,
            description: 'Stylish slim fit pants',
            image: 'https://placehold.co/300x200?text=Pants',
            category: 'Pants',
          },
          {
            id: '3',
            name: 'Baseball Cap',
            price: 15,
            description: 'Classic baseball cap',
            image: 'https://placehold.co/300x200?text=Hat',
            category: 'Hats',
          },
          {
            id: '4',
            name: 'Leather Jacket',
            price: 120,
            description: 'Premium leather jacket',
            image: 'https://placehold.co/300x200?text=Jacket',
            category: 'Jackets',
          },
        ]);
        setCategories(['All', 'T-Shirts', 'Pants', 'Hats', 'Jackets']);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : selectedCategory ? products.filter(product => product.category === selectedCategory) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header onLogoClick={() => setSelectedCategory(null)} />
      <main className="pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold font-serif text-gray-900 mb-4">Discover Our Collection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our curated selection of high-quality clothing designed for style and comfort.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {!selectedCategory && (
              <div className="flex flex-wrap w-full mt-4">
                {categories.map((category) => {
                  const firstProduct = category === 'All' 
                    ? products[0] 
                    : products.find(p => p.category === category);
                  
                  const bgImage = firstProduct?.image || `https://placehold.co/600x400?text=${category}`;

                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="flex-auto basis-[280px] sm:basis-[320px] relative overflow-hidden group h-[300px] sm:h-[380px]"
                    >
                      <img 
                        src={bgImage} 
                        alt={category} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold font-serif tracking-widest uppercase drop-shadow-md">
                          {category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedCategory && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md hover:-translate-y-1'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <h3 className="text-3xl font-serif text-gray-900 mb-8 text-center">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => router.push(`/product/${product.id}`)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[400px]"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex justify-between items-end gap-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 block">
                        {product.category}
                      </span>
                      <h4 className="text-2xl font-serif font-bold text-white leading-tight mb-1">
                        {product.name}
                      </h4>
                      <p className="text-xl font-serif text-white/90">
                        ${product.price}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="bg-white text-gray-900 hover:bg-gray-200 rounded-full p-4 shadow-lg transition-transform hover:scale-110 active:scale-95"
                      title="Add to Cart"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found in this category.</p>
              </div>
            )}
              </div>
            )}
          </>
        )}
      </main>



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


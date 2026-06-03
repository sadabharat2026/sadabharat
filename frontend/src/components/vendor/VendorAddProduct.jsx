import React, { useState } from 'react';
import { Upload, X, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

const VendorAddProduct = () => {
  const { addProduct } = useShop();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  
  // Standard pricing and stock (when no variants are used)
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  
  const [category, setCategory] = useState('Select Category');
  const [subCategory, setSubCategory] = useState('Select Sub Category');
  const [tags, setTags] = useState('');

  // Regulatory & Logistics fields
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [noRefund, setNoRefund] = useState(false);
  const [codAvailable, setCodAvailable] = useState(false);
  const [dosage, setDosage] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([
    { size: '100 ml', price: '', oldPrice: '', stock: '', sku: '' }
  ]);

  // Mock handling drag and drop or file select
  const handleFileChange = (e) => {
    if (images.length < 4) {
      setImages([...images, `https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60`]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { size: '', price: '', oldPrice: '', stock: '', sku: '' }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Product Name is required!");
      return;
    }

    const newId = 'custom-prod-' + Date.now();
    let finalPrice = parseFloat(price) || 299;
    let finalOldPrice = parseFloat(oldPrice) || 399;
    let processedVariants = [];

    if (hasVariants) {
      processedVariants = variants.map(v => ({
        size: v.size || '100 ml',
        price: parseFloat(v.price) || 299,
        oldPrice: parseFloat(v.oldPrice) || 399,
        stock: parseInt(v.stock, 10) || 100,
        sku: v.sku || ''
      }));
      if (processedVariants.length > 0) {
        finalPrice = processedVariants[0].price;
        finalOldPrice = processedVariants[0].oldPrice;
      }
    }

    const newProduct = {
      _id: newId,
      name,
      price: finalPrice,
      oldPrice: finalOldPrice,
      rating: 4.8,
      reviews: 0,
      image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
      gallery: images.length > 0 ? images : ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60'],
      category: category !== 'Select Category' ? category : 'Wellness',
      subCategory: subCategory !== 'Select Sub Category' ? subCategory : '',
      description,
      ingredients,
      benefits,
      dosage,
      disclaimer,
      prescriptionRequired,
      noRefund,
      codAvailable,
      variants: hasVariants ? processedVariants : null,
      stock: hasVariants ? null : (parseInt(stock, 10) || 100),
      sku: hasVariants ? null : sku,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      bestseller: false,
      recommended: true
    };

    addProduct(newProduct);
    window.showVendorToast?.('Product submitted successfully!', 'success');
    navigate(`/product/${newId}`);
  };

  const handleSaveDraft = () => {
    window.showVendorToast?.('Draft saved successfully!', 'success');
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto -mt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Add New Product</h1>
            <p className="text-[12px] text-gray-500 mt-0.5 font-sans">Fill in the details to list your product.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveDraft} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg text-[12px] shadow-sm hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-[#054425] text-white font-medium rounded-lg text-[12px] shadow-sm hover:bg-[#04331c] transition-colors">
            Submit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">General Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Neem Tulsi Face Wash" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Description</label>
                <textarea 
                  rows="3" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a detailed product description..." 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Key Ingredients (comma separated)</label>
                  <textarea 
                    rows="2" 
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g. Bhringraj, Amla, Coconut Oil, Brahmi" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Benefits</label>
                  <textarea 
                    rows="2" 
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="e.g. Clears acne, Purifies skin..." 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Dosage and Disclaimer Textareas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Dosage & Usage Guidelines</label>
                  <textarea 
                    rows="2" 
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. Take 1 capsule twice daily with warm milk/water after meals or as directed by the physician." 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Disclaimer Guidelines</label>
                  <textarea 
                    rows="2" 
                    value={disclaimer}
                    onChange={(e) => setDisclaimer(e.target.value)}
                    placeholder="e.g. Keep out of reach of children. Store in a cool dry place. Consult a doctor before use if pregnant." 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Variants Editor Section */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-2 mb-3 bg-[#F0F7F2] p-2.5 rounded-lg border border-[#C8E6C9]">
              <input
                type="checkbox"
                id="hasVariants"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
              />
              <label htmlFor="hasVariants" className="text-[11px] font-bold text-[#1B5E20] cursor-pointer select-none">
                This product has variants (e.g. sizes, weights, counts)
              </label>
            </div>

            {hasVariants ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 text-[12px]">Manage Variants</h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-2.5 py-1.5 bg-[#054425]/10 text-[#054425] hover:bg-[#054425]/20 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    + Add Variant Row
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase font-bold tracking-wider border-b border-gray-100">
                        <th className="px-2 py-2 w-1/4">Size / Unit</th>
                        <th className="px-2 py-2 w-1/5">Price (₹)</th>
                        <th className="px-2 py-2 w-1/5">MRP (₹)</th>
                        <th className="px-2 py-2 w-1/5">Stock</th>
                        <th className="px-2 py-2 w-1/5">SKU</th>
                        <th className="px-2 py-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {variants.map((v, index) => (
                        <tr key={index} className="text-xs">
                          <td className="p-1">
                            <input
                              type="text"
                              placeholder="e.g. 200 ml"
                              value={v.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="349"
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="499"
                              value={v.oldPrice}
                              onChange={(e) => handleVariantChange(index, 'oldPrice', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              placeholder="50"
                              value={v.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              placeholder="SKU"
                              value={v.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 rounded-md text-[11px] outline-none focus:border-[#054425] uppercase"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              disabled={variants.length <= 1}
                              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-30"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 font-sans">Single product listing. Dynamic variants are disabled. Fill the single Pricing & Stock settings in the sidebar.</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Product Media</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
               <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} multiple accept="image/*" />
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-[#054425]">
                 <Upload size={20} />
               </div>
               <p className="text-[12px] font-bold text-gray-900 mb-0.5">Click to upload or drag & drop</p>
               <p className="text-[10px] text-gray-500 font-sans">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>

            {images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#054425]/80 text-white text-[8px] font-bold text-center py-0.5">MAIN</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          {!hasVariants && (
            <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Pricing & Stock</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="299" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">MRP (₹)</label>
                  <input 
                    type="number" 
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="399" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">SKU</label>
                  <input 
                    type="text" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SB-NTFW-100" 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800 uppercase" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* New Regulatory & Logistics Policy Controls */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Regulatory & Logistics</h3>
            <div className="space-y-3 font-sans">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prescriptionRequired}
                  onChange={(e) => setPrescriptionRequired(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">Prescription Required</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Check if this is a prescription-only ayurvedic medicine</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-gray-50 pt-2.5">
                <input
                  type="checkbox"
                  checked={noRefund}
                  onChange={(e) => setNoRefund(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">No Refund Details</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Check if this product is non-refundable (e.g. hygiene)</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none border-t border-gray-50 pt-2.5">
                <input
                  type="checkbox"
                  checked={codAvailable}
                  onChange={(e) => setCodAvailable(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#054425] rounded focus:ring-[#054425] accent-[#054425] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-750 font-bold leading-none">Cash on Delivery (COD)</span>
                  <span className="text-[9px] text-gray-400 font-semibold mt-0.5">Manage and allow Cash on Delivery for this product</span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-[13px]">Organization</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-700 cursor-pointer"
                >
                  <option>Select Category</option>
                  <option>Skin Care</option>
                  <option>Hair Care</option>
                  <option>Wellness</option>
                  <option>Soaps</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Sub Category</label>
                <select 
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-700 cursor-pointer"
                >
                  <option>Select Sub Category</option>
                  <option>Face Wash</option>
                  <option>Toner</option>
                  <option>Serum</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Tags</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. acne, organic, vegan" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] focus:outline-none focus:border-[#054425] focus:ring-1 focus:ring-[#054425] font-sans font-medium text-gray-800" 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-[#F0F7F2] border border-[#C8E6C9] rounded-xl p-3 flex items-start gap-2">
             <div className="mt-0.5 text-[#388E3C]"><CheckCircle size={14} /></div>
             <div>
                <h4 className="text-[11px] font-bold text-[#1B5E20] mb-0.5">Approval Process</h4>
                <p className="text-[10px] text-[#2E7D32] font-sans font-medium leading-relaxed">After submission, your product will be reviewed by our admin team within 24 hours before going live.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAddProduct;

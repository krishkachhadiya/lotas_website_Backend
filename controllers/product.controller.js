const Product = require('../models/Product.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const cleanMeta = (str) => str?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate('category', 'title slug')
    .populate('subcategory', 'title slug')
    .sort({ createdAt: -1 });
  return res.json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category')
    .populate('subcategory');
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, { product }, 'Product fetched');
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
    .populate('category')
    .populate('subcategory');
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, { product }, 'Product fetched');
});

const createProduct = asyncHandler(async (req, res) => {
  let { title, slug, description, metaTitle, metaDescription, category, subcategory, status, images, specifications } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim())  throw new ApiError(400, 'Slug is required');

  const titleExists = await Product.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
  if (titleExists) throw new ApiError(400, 'Product already exists');

  const slugExists = await Product.findOne({ slug: slug.trim().toLowerCase() });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const product = await Product.create({
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    description: description || '',
    metaTitle: cleanMeta(metaTitle),
    metaDescription: cleanMeta(metaDescription),
    category: category || null,
    subcategory: subcategory || null,
    status: status || 'active',
    images: images || [],
    specifications: specifications || []
  });

  return success(res, { product }, 'Product Added Successfully', 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { title, slug, description, metaTitle, metaDescription, category, subcategory, status, images, specifications } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');

  const titleExists = await Product.findOne({
    title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
    _id: { $ne: req.params.id }
  });
  if (titleExists) throw new ApiError(400, 'Product title already taken');

  if (slug) {
    const slugExists = await Product.findOne({ slug: slug.toLowerCase(), _id: { $ne: req.params.id } });
    if (slugExists) throw new ApiError(400, 'Slug already exists');
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      title: title.trim(), slug: slug?.toLowerCase(),
      description, metaTitle: cleanMeta(metaTitle),
      metaDescription: cleanMeta(metaDescription),
      category: category || null, subcategory: subcategory || null,
      status, images, specifications
    },
    { new: true, runValidators: true }
  );

  if (!product) throw new ApiError(404, 'Product not found');

  return success(res, { product }, 'Product Updated Successfully');
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, {}, 'Product Deleted Successfully');
});

module.exports = { getProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct };

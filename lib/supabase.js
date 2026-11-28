import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, user_type, avatar_url, profile_picture, preferred_language, created_at, is_banned')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const signUp = async (email, password, fullName, userType) => {
  const mappedUserType = userType === 'regular' ? 'user' : userType;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: mappedUserType
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Public-safe listing columns — excludes internal counters and timestamps
// that have no display value on public pages.
const PUBLIC_LISTING_FIELDS = `
  id,
  title,
  slug,
  description,
  category,
  subcategory,
  location,
  address,
  what3words,
  phone,
  email,
  website,
  whatsapp,
  images,
  features,
  business_hours,
  status,
  is_available,
  price,
  created_at,
  business_profiles(business_name, verified),
  reviews(rating)
`;

export const getListings = async (filters = {}) => {
  let query = supabase
    .from('listings')
    .select(PUBLIC_LISTING_FIELDS)
    .in('status', ['active', 'boosted', 'featured']);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.featured) {
    query = query.in('status', ['featured', 'boosted']);
  }

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getBoostedListings = async (filters = {}) => {
  let query = supabase
    .from('listings')
    .select(PUBLIC_LISTING_FIELDS)
    .eq('status', 'boosted');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getRegularListings = async (filters = {}) => {
  let query = supabase
    .from('listings')
    .select(PUBLIC_LISTING_FIELDS)
    .eq('status', 'active');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const getListingsCount = async (filters = {}) => {
  let query = supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.location) {
    query = query.eq('location', filters.location);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count;
};

export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      listing_id,
      listings(
        id, title, slug, description, category, location,
        images, status, phone, email, website, whatsapp, price, created_at,
        business_profiles(business_name, verified)
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const toggleFavorite = async (userId, listingId) => {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, listing_id: listingId });

    if (error) throw error;
    return true;
  }
};

export const createReview = async (listingId, userId, rating, title, comment) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      listing_id: listingId,
      user_id: userId,
      rating,
      title,
      comment
    });

  if (error) throw error;
  return data;
};

export const getBusinessProfile = async (userId) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createBusinessProfile = async (userId, businessName, businessType, description) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert({
      user_id: userId,
      business_name: businessName,
      business_type: businessType,
      description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getBusinessListings = async (businessId) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createListing = async (listingData) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateListing = async (listingId, updates) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteListing = async (listingId) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (error) throw error;
};

export const purchaseTokens = async (businessId, amount, paymentMethod) => {
  const { data, error } = await supabase.rpc('purchase_tokens', {
    business_id: businessId,
    token_amount: amount,
    payment_method: paymentMethod
  });

  if (error) throw error;
  return data;
};

export const boostListing = async (listingId, businessId, days = 7) => {
  const { data: business } = await supabase
    .from('business_profiles')
    .select('token_balance')
    .eq('id', businessId)
    .single();

  if (business.token_balance < 5) {
    throw new Error('Insufficient tokens');
  }

  const boostExpiresAt = new Date();
  boostExpiresAt.setDate(boostExpiresAt.getDate() + days);

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      status: 'boosted',
      boost_expires_at: boostExpiresAt.toISOString()
    })
    .eq('id', listingId);

  if (updateError) throw updateError;

  const { error: tokenError } = await supabase
    .from('business_profiles')
    .update({
      token_balance: business.token_balance - 5,
      total_tokens_spent: supabase.raw('total_tokens_spent + 5')
    })
    .eq('id', businessId);

  if (tokenError) throw tokenError;

  const { error: transactionError } = await supabase
    .from('token_transactions')
    .insert({
      business_id: businessId,
      amount: -5,
      type: 'spent',
      description: 'Boosted listing',
      payment_status: 'completed'
    });

  if (transactionError) throw transactionError;

  return true;
};

export const getMessages = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(full_name, avatar_url),
      listings(title)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const sendMessage = async (senderId, recipientId, listingId, subject, message) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      listing_id: listingId,
      subject,
      message
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markMessageAsRead = async (messageId) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  if (error) throw error;
};

export const getAnalytics = async (businessId, startDate, endDate) => {
  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('business_id', businessId);

  const listingIds = listings.map(l => l.id);

  const { data, error } = await supabase
    .from('listing_analytics')
    .select('*')
    .in('listing_id', listingIds)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
};

export const incrementViewCount = async (listingId) => {
  const { error } = await supabase.rpc('increment_view_count', {
    listing_uuid: listingId
  });

  if (error) console.error('Error incrementing view count:', error);
};

export const incrementContactCount = async (listingId) => {
  const { error } = await supabase.rpc('increment_contact_count', {
    listing_uuid: listingId
  });

  if (error) console.error('Error incrementing contact count:', error);
};

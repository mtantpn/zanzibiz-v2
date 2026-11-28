/*
  # Add Admin User Creation and Enhanced Analytics

  1. Functions
    - `admin_create_user` - Create users from admin panel with all account types
    - `get_revenue_analytics` - Get financial analytics and revenue data
    - `get_platform_insights` - Get comprehensive platform insights
    - `get_user_growth_data` - Get user growth over time
    - `get_listing_performance` - Get top performing listings
    
  2. Security
    - All functions require admin privileges
    - Proper validation and error handling
*/

-- Function to create user from admin panel
CREATE OR REPLACE FUNCTION admin_create_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_user_type text DEFAULT 'user',
  p_business_name text DEFAULT NULL,
  p_initial_tokens integer DEFAULT 0
)
RETURNS jsonb AS $$
DECLARE
  admin_id uuid;
  new_user_id uuid;
  new_business_id uuid;
  result jsonb;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;
  
  -- Validate user type
  IF p_user_type NOT IN ('user', 'business', 'admin') THEN
    RAISE EXCEPTION 'Invalid user type. Must be user, business, or admin';
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;
  
  -- Generate a random UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Create profile
  INSERT INTO profiles (id, email, full_name, user_type)
  VALUES (new_user_id, p_email, p_full_name, p_user_type);
  
  -- If business account, create business profile
  IF p_user_type = 'business' THEN
    INSERT INTO business_profiles (user_id, business_name, token_balance)
    VALUES (
      new_user_id,
      COALESCE(p_business_name, p_full_name),
      p_initial_tokens
    )
    RETURNING id INTO new_business_id;
    
    result := jsonb_build_object(
      'success', true,
      'user_id', new_user_id,
      'business_id', new_business_id,
      'email', p_email,
      'user_type', p_user_type,
      'message', 'Business user created successfully. Login credentials need to be set up via email.'
    );
  ELSE
    result := jsonb_build_object(
      'success', true,
      'user_id', new_user_id,
      'email', p_email,
      'user_type', p_user_type,
      'message', 'User created successfully. Login credentials need to be set up via email.'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;

-- Function to get revenue analytics
CREATE OR REPLACE FUNCTION get_revenue_analytics(
  p_days integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  admin_id uuid;
  total_revenue numeric;
  pending_revenue numeric;
  completed_revenue numeric;
  token_sales_count integer;
  avg_purchase_value numeric;
  result jsonb;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view revenue analytics';
  END IF;
  
  -- Calculate revenue metrics
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0),
    COUNT(*),
    COALESCE(AVG(amount), 0)
  INTO 
    total_revenue,
    pending_revenue,
    completed_revenue,
    token_sales_count,
    avg_purchase_value
  FROM token_purchases
  WHERE created_at >= CURRENT_DATE - p_days;
  
  result := jsonb_build_object(
    'total_revenue', total_revenue,
    'pending_revenue', pending_revenue,
    'completed_revenue', completed_revenue,
    'token_sales_count', token_sales_count,
    'avg_purchase_value', ROUND(avg_purchase_value, 2),
    'period_days', p_days
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_revenue_analytics TO authenticated;

-- Function to get platform insights
CREATE OR REPLACE FUNCTION get_platform_insights()
RETURNS jsonb AS $$
DECLARE
  admin_id uuid;
  total_users integer;
  active_users_30d integer;
  total_businesses integer;
  verified_businesses integer;
  total_listings integer;
  active_listings integer;
  total_reviews integer;
  avg_rating numeric;
  total_page_views bigint;
  total_messages integer;
  banned_users integer;
  result jsonb;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view platform insights';
  END IF;
  
  -- Get user metrics
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  SELECT COUNT(DISTINCT user_id) INTO active_users_30d
  FROM page_views
  WHERE viewed_at >= CURRENT_DATE - 30;
  
  -- Get business metrics
  SELECT COUNT(*) INTO total_businesses FROM business_profiles;
  SELECT COUNT(*) INTO verified_businesses FROM business_profiles WHERE verified = true;
  
  -- Get listing metrics
  SELECT COUNT(*) INTO total_listings FROM listings;
  SELECT COUNT(*) INTO active_listings FROM listings WHERE status = 'active';
  
  -- Get review metrics
  SELECT COUNT(*), COALESCE(AVG(rating), 0)
  INTO total_reviews, avg_rating
  FROM reviews;
  
  -- Get engagement metrics
  SELECT COALESCE(SUM(view_count), 0) INTO total_page_views FROM page_views;
  SELECT COUNT(*) INTO total_messages FROM messages;
  
  -- Get moderation metrics
  SELECT COUNT(*) INTO banned_users FROM user_bans WHERE is_active = true;
  
  result := jsonb_build_object(
    'users', jsonb_build_object(
      'total', total_users,
      'active_30d', active_users_30d,
      'banned', banned_users
    ),
    'businesses', jsonb_build_object(
      'total', total_businesses,
      'verified', verified_businesses,
      'verification_rate', CASE WHEN total_businesses > 0 
        THEN ROUND((verified_businesses::numeric / total_businesses) * 100, 1) 
        ELSE 0 END
    ),
    'listings', jsonb_build_object(
      'total', total_listings,
      'active', active_listings,
      'active_rate', CASE WHEN total_listings > 0 
        THEN ROUND((active_listings::numeric / total_listings) * 100, 1) 
        ELSE 0 END
    ),
    'engagement', jsonb_build_object(
      'total_reviews', total_reviews,
      'avg_rating', ROUND(avg_rating, 2),
      'total_messages', total_messages,
      'total_page_views', total_page_views
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_platform_insights TO authenticated;

-- Function to get user growth data
CREATE OR REPLACE FUNCTION get_user_growth_data(
  p_days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  new_users bigint,
  new_businesses bigint,
  total_users bigint
) AS $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view user growth data';
  END IF;
  
  RETURN QUERY
  WITH RECURSIVE dates AS (
    SELECT CURRENT_DATE - p_days AS date
    UNION ALL
    SELECT date + 1
    FROM dates
    WHERE date < CURRENT_DATE
  ),
  daily_new_users AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM profiles
    WHERE created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(created_at)
  ),
  daily_new_businesses AS (
    SELECT 
      DATE(bp.created_at) as date,
      COUNT(*) as count
    FROM business_profiles bp
    WHERE bp.created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(bp.created_at)
  )
  SELECT 
    d.date,
    COALESCE(dnu.count, 0) as new_users,
    COALESCE(dnb.count, 0) as new_businesses,
    (SELECT COUNT(*) FROM profiles WHERE created_at <= d.date) as total_users
  FROM dates d
  LEFT JOIN daily_new_users dnu ON d.date = dnu.date
  LEFT JOIN daily_new_businesses dnb ON d.date = dnb.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_user_growth_data TO authenticated;

-- Function to get top performing listings
CREATE OR REPLACE FUNCTION get_listing_performance(
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  listing_id uuid,
  title text,
  business_name text,
  view_count integer,
  contact_count integer,
  review_count bigint,
  avg_rating numeric,
  status text
) AS $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := auth.uid();
  
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view listing performance';
  END IF;
  
  RETURN QUERY
  SELECT 
    l.id as listing_id,
    l.title,
    bp.business_name,
    l.view_count,
    l.contact_count,
    COUNT(r.id) as review_count,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    l.status
  FROM listings l
  JOIN business_profiles bp ON l.business_id = bp.id
  LEFT JOIN reviews r ON l.id = r.listing_id
  GROUP BY l.id, l.title, bp.business_name, l.view_count, l.contact_count, l.status
  ORDER BY (l.view_count + l.contact_count * 5) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION get_listing_performance TO authenticated;

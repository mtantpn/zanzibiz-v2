import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WelcomeEmailPayload {
  email: string;
  full_name: string;
  user_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service not configured',
          message: 'RESEND_API_KEY environment variable is required'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const payload: WelcomeEmailPayload = await req.json();
    const { email, full_name, user_id } = payload;

    // Get user's first name
    const firstName = full_name ? full_name.split(' ')[0] : 'there';

    // Create welcome email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ZanziBiz</div>
            <p style="margin: 0; font-size: 18px;">Welcome to Zanzibar's Business Directory</p>
          </div>
          <div class="content">
            <h2 style="color: #FF6B35;">Welcome, ${firstName}!</h2>
            <p>Thank you for registering with ZanziBiz, Zanzibar's premier local business directory platform.</p>

            <p>Your account has been successfully created! You can now:</p>
            <ul>
              <li>Browse and discover local businesses across Zanzibar</li>
              <li>Save your favorite listings for quick access</li>
              <li>Connect with businesses directly through our platform</li>
              <li>Stay updated with the latest business news and insights</li>
            </ul>

            <div style="text-align: center;">
              <a href="https://zanzibiz.com" class="button">Start Exploring</a>
            </div>

            <p>If you're a business owner and want to list your business, you can upgrade your account to a business profile at any time.</p>

            <p><strong>Need Help?</strong><br>
            Visit our Help Center or contact us at support@zanzibiz.com</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 ZanziBiz. All rights reserved.</p>
            <p>Connecting Zanzibar's Businesses with the Community</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ZanziBiz <noreply@zanzibiz.com>',
        to: [email],
        subject: 'Welcome to ZanziBiz - Your Account is Ready!',
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Email sending error:', resendData);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData.message || 'Failed to send email',
          message: 'Email could not be sent but user registration succeeded'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Welcome email sent successfully to ${email}, ID: ${resendData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: resendData.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in send-welcome-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        status: 200, // Return 200 so registration isn't blocked
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

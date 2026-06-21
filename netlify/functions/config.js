exports.handler = async () => {
    const body = `window.ENV = {
  SUPABASE_URL: ${JSON.stringify(process.env.SUPABASE_URL || '')},
  SUPABASE_PUBLISHABLE_KEY: ${JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY || '')},
  SUPABASE_JWKS_URL: ${JSON.stringify(process.env.SUPABASE_JWKS_URL || '')},
  STRIPE_PUBLISHABLE_KEY: ${JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY || '')}
};`;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        },
        body
    };
};

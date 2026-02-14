import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validate OAuth configuration for a provider
 */
const validateOAuthConfig = (provider) => {
  const configs = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    },
  };

  const config = configs[provider.toLowerCase()];
  
  if (!config) {
    throw new ApiError(400, `Unsupported OAuth provider: ${provider}`);
  }

  if (!config.clientId || !config.clientSecret) {
    throw new ApiError(
      500,
      `OAuth configuration missing for ${provider}. Please check environment variables.`
    );
  }

  return config;
};

/**
 * Exchange Google authorization code for user info
 */
export const exchangeGoogleCode = async (code) => {
  try {
    const config = validateOAuthConfig('google');

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${process.env.CLIENT_URL}/auth/google/callback`,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000, // 10 second timeout
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from Google');
    }

    // Get user info from Google
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      }
    );

    const userInfo = userInfoResponse.data;

    // Validate required fields
    if (!userInfo.email) {
      throw new Error('Email not provided by Google');
    }

    return {
      provider: 'google',
      providerId: userInfo.id,
      email: userInfo.email,
      fullName: userInfo.name || userInfo.email.split('@')[0],
      picture: userInfo.picture,
      verified: userInfo.verified_email || false,
      locale: userInfo.locale,
    };
  } catch (error) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    
    if (error.response?.data?.error_description) {
      throw new ApiError(400, `Google OAuth: ${error.response.data.error_description}`);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new ApiError(408, 'Google OAuth request timeout. Please try again.');
    }
    
    throw new ApiError(
      400,
      error.message || 'Failed to authenticate with Google'
    );
  }
};

/**
 * Exchange GitHub authorization code for user info
 */
export const exchangeGitHubCode = async (code) => {
  try {
    const config = validateOAuthConfig('github');

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${process.env.CLIENT_URL}/auth/github/callback`,
      },
      {
        headers: { Accept: 'application/json' },
        timeout: 10000,
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      throw new Error(error_description || error);
    }

    if (!access_token) {
      throw new Error('No access token received from GitHub');
    }

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 10000,
    });

    const user = userResponse.data;

    // Get user email (might be private)
    let email = user.email;
    
    if (!email) {
      try {
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
          timeout: 10000,
        });

        // Find primary verified email
        const primaryEmail = emailResponse.data.find((e) => e.primary && e.verified);
        
        if (primaryEmail) {
          email = primaryEmail.email;
        } else {
          // Fallback to any verified email
          const verifiedEmail = emailResponse.data.find((e) => e.verified);
          email = verifiedEmail?.email || emailResponse.data[0]?.email;
        }
      } catch (emailError) {
        console.error('GitHub email fetch error:', emailError.message);
      }
    }

    if (!email) {
      throw new Error(
        'Unable to get email from GitHub. Please make sure your email is public or grant email permission.'
      );
    }

    return {
      provider: 'github',
      providerId: user.id.toString(),
      email,
      fullName: user.name || user.login,
      picture: user.avatar_url,
      verified: true, // GitHub emails are verified
      username: user.login,
      bio: user.bio,
    };
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new ApiError(401, 'Invalid GitHub authorization code');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new ApiError(408, 'GitHub OAuth request timeout. Please try again.');
    }
    
    throw new ApiError(
      400,
      error.message || 'Failed to authenticate with GitHub'
    );
  }
};

/**
 * Exchange Facebook authorization code for user info
 */
export const exchangeFacebookCode = async (code) => {
  try {
    const config = validateOAuthConfig('facebook');

    // Exchange code for access token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: `${process.env.CLIENT_URL}/auth/facebook/callback`,
          code,
        },
        timeout: 10000,
      }
    );

    const { access_token, error } = tokenResponse.data;

    if (error) {
      throw new Error(error.message || 'Facebook token exchange failed');
    }

    if (!access_token) {
      throw new Error('No access token received from Facebook');
    }

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,name,email,picture.type(large),first_name,last_name',
        access_token,
      },
      timeout: 10000,
    });

    const user = userResponse.data;

    if (!user.email) {
      throw new Error(
        'Email permission not granted. Please allow email access to continue.'
      );
    }

    return {
      provider: 'facebook',
      providerId: user.id,
      email: user.email,
      fullName: user.name || `${user.first_name} ${user.last_name}`.trim(),
      picture: user.picture?.data?.url,
      verified: true, // Facebook emails are verified
      firstName: user.first_name,
      lastName: user.last_name,
    };
  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      throw new ApiError(
        400,
        `Facebook OAuth: ${fbError.message || fbError.type}`
      );
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new ApiError(408, 'Facebook OAuth request timeout. Please try again.');
    }
    
    throw new ApiError(
      400,
      error.message || 'Failed to authenticate with Facebook'
    );
  }
};

/**
 * Main OAuth handler - routes to appropriate provider
 */
export const handleOAuthExchange = async (provider, code) => {
  if (!code) {
    throw new ApiError(400, 'Authorization code is required');
  }

  const providerLower = provider.toLowerCase();

  switch (providerLower) {
    case 'google':
      return await exchangeGoogleCode(code);
    case 'github':
      return await exchangeGitHubCode(code);
    case 'facebook':
      return await exchangeFacebookCode(code);
    default:
      throw new ApiError(400, `Unsupported OAuth provider: ${provider}`);
  }
};

/**
 * Verify OAuth state parameter (CSRF protection)
 * This should be called before processing OAuth callback
 */
export const verifyOAuthState = (receivedState, expectedState) => {
  if (!receivedState || !expectedState) {
    throw new ApiError(400, 'Missing state parameter');
  }

  if (receivedState !== expectedState) {
    throw new ApiError(400, 'Invalid state parameter. Possible CSRF attack.');
  }

  return true;
};

/**
 * Get OAuth provider display name
 */
export const getProviderDisplayName = (provider) => {
  const names = {
    google: 'Google',
    github: 'GitHub',
    facebook: 'Facebook',
  };
  return names[provider.toLowerCase()] || provider;
};

export const templates = {
  verifyEmail: ({ name, verificationLink }) => `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 16px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#667eea"/>
          </svg>
        </div>
        <h2 style="color: #333; font-size: 28px; margin-bottom: 20px; text-align: center; font-weight: 600;">Hello ${name}!</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">Thank you for registering. Please verify your email address to get started.</p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verificationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">Verify Email Address</a>
        </div>
        <p style="color: #999; font-size: 14px; line-height: 1.5; margin-bottom: 10px; text-align: center;">This link will expire in 1 hour for security reasons.</p>
        <p style="color: #999; font-size: 14px; line-height: 1.5; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </div>
  `,

  resetPassword: ({ name, resetLink }) => `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; border-radius: 16px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M12 2C8.13 2 5 5.13 5 9V15C5 18.87 8.13 22 12 22C15.87 22 19 18.87 19 15V9C19 5.13 15.87 2 12 2ZM17 15C17 17.76 14.76 20 12 20C9.24 20 7 17.76 7 15V9C7 6.24 9.24 4 12 4C14.76 4 17 6.24 17 9V15Z" fill="#f5576c"/>
          </svg>
        </div>
        <h2 style="color: #333; font-size: 28px; margin-bottom: 20px; text-align: center; font-weight: 600;">Password Reset</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">Hello ${name},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">We received a request to reset your password. Click the button below to proceed.</p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 500; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 14px; line-height: 1.5; margin-bottom: 10px; text-align: center;">This link will expire in 1 hour for security reasons.</p>
        <p style="color: #999; font-size: 14px; line-height: 1.5; text-align: center;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </div>
  `,

  oauthLoginAlert: ({ name, provider, ip, device }) => `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 20px; border-radius: 16px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#fa709a"/>
          </svg>
        </div>
        <h2 style="color: #333; font-size: 28px; margin-bottom: 20px; text-align: center; font-weight: 600;">Security Alert</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">Hello ${name},</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">Your account was just accessed using <strong style="color: #fa709a;">${provider}</strong>.</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 5px 0; color: #666;"><strong style="color: #333;">Device:</strong> ${device}</p>
          <p style="margin: 5px 0; color: #666;"><strong style="color: #333;">IP Address:</strong> ${ip}</p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">If this was you, no action is needed. If not, please reset your password immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </div>
  `,

  welcomeEmail: ({ name }) => `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 20px; border-radius: 16px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#4facfe"/>
          </svg>
        </div>
        <h2 style="color: #333; font-size: 32px; margin-bottom: 20px; text-align: center; font-weight: 600;">Welcome ${name}! 🎉</h2>
        <p style="color: #666; font-size: 18px; line-height: 1.6; margin-bottom: 30px; text-align: center;">We're absolutely thrilled to have you on board!</p>
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 8px; padding: 30px; margin-bottom: 30px;">
          <p style="color: #444; font-size: 16px; line-height: 1.8; margin: 0; text-align: center;">Get ready to explore amazing features and create something extraordinary with us. Your journey starts now!</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </div>
  `,

  blockedAlert: ({ name, reason }) => `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%); padding: 40px 20px; border-radius: 16px;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#ff6b6b"/>
          </svg>
        </div>
        <h2 style="color: #333; font-size: 28px; margin-bottom: 20px; text-align: center; font-weight: 600;">Account Blocked</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">Hi ${name},</p>
        <div style="background: #fff5f5; border-left: 4px solid #ff6b6b; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
          <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0;"><strong style="color: #ff6b6b;">Reason:</strong> ${reason}</p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: center;">Please contact our support team if you believe this is a mistake or need assistance.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
        <p style="color: #aaa; font-size: 13px; text-align: center; margin: 0;">&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </div>
  `,
};

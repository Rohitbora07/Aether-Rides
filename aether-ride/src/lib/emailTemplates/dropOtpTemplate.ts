export const dropOtpTemplate = (otp: string, driverName: string, vehicleModel: string, licensePlate: string) => {
  const otpDigits = otp.split('');
  const otpHtml = otpDigits
    .map(
      (digit) => `
      <td align="center" style="padding: 0 4px;">
        <div style="width: 44px; height: 50px; line-height: 50px; background-color: #F9F8F6; border: 1px solid #EAE7E2; border-radius: 4px; color: #1A1A1A; font-size: 22px; font-weight: 300; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
          ${digit}
        </div>
      </td>
    `
    )
    .join('');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Arrived at Your Destination</title>
  </head>
<body style="margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#F9F8F6;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F9F8F6;table-layout:fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px 60px 16px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 440px; background-color: #ffffff; border: 1px solid #EAE7E2; border-radius: 0px; box-shadow: 0 4px 24px rgba(0,0,0,0.02);">
          
          <tr>
            <td align="center" style="padding: 40px 40px 0 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid #F2EFEA;">
                    <div style="color:#1A1A1A; font-size:12px; font-weight:500; letter-spacing:5px; margin:0; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
                      AETHER
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="left" style="padding: 36px 40px 28px 40px;">
              <h1 style="color:#1A1A1A; font-size:20px; font-weight:300; margin:0; letter-spacing: -0.3px; line-height: 1.3;">
                Your trip is complete.
              </h1>
              <p style="color:#706E6B; font-size:13px; line-height:1.6; margin: 10px 0 0 0; font-weight: 400;">
                Please provide the drop-off confirmation code below to your driver to securely authorize the end of your trip.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 36px 40px;">
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  ${otpHtml}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #F2EFEA;">
                <tr><td></td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="left" style="padding: 32px 40px 36px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="middle" style="padding-bottom: 16px;">
                    <span style="color: #A3A09B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Driver Name</span>
                  </td>
                  <td align="right" valign="middle" style="padding-bottom: 16px;">
                    <span style="color: #1A1A1A; font-size: 14px; font-weight: 400; line-height: 1.4;">${driverName}</span>
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="middle" style="padding-bottom: 16px;">
                    <span style="color: #A3A09B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Vehicle Model</span>
                  </td>
                  <td align="right" valign="middle" style="padding-bottom: 16px;">
                    <span style="color: #1A1A1A; font-size: 14px; font-weight: 400; line-height: 1.4;">${vehicleModel}</span>
                  </td>
                </tr>
                <tr>
                  <td align="left" valign="middle">
                    <span style="color: #A3A09B; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">License</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 2px 8px; background-color: #F4F2EE; border: 1px solid #EAE7E2; border-radius: 3px; color: #2C2A29; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;">
                      ${licensePlate}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="left" style="padding: 24px 40px 32px 40px; background-color: #FDFDFD; border-top: 1px solid #F9F8F6;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="color:#94918C; font-size:11px; line-height:1.6; margin:0; font-weight: 400;">
                      <strong style="color: #706E6B; font-weight: 500;">Safety Protocol:</strong> Ensure you have collected all personal belongings before stepping out of the vehicle. Do not share drop-off pins through external digital channels.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 440px;">
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="color:#A3A09B; font-size:11px; margin:0; letter-spacing: 0.3px;">
                &copy; 2026 Aether Technologies Inc. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        </td>
    </tr>
  </table>
</body>
</html>`;
};
export const verifyEmailTemplate = (otp: string) => {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" style="padding:40px 0;background:#0a0a0a;">
    <tr>
      <td align="center">
        <table width="420" style="background:#111;border-radius:16px;padding:40px 30px;text-align:center;border:1px solid #1f1f1f;">

          <tr>
            <td>
              <h1 style="color:#fff;font-weight:300;letter-spacing:4px;margin:0;font-size:20px;">AETHER RIDES</h1>
              <p style="color:#777;font-size:12px;letter-spacing:2px;margin:8px 0 0;">EMAIL VERIFICATION</p>
            </td>
          </tr>

          <tr><td style="height:30px;"></td></tr>

          <tr>
            <td>
              <p style="color:#aaa;font-size:14px;font-weight:300;margin:0;">Enter the verification code below</p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 0;">
              <div style="font-size:36px;letter-spacing:10px;color:#00e5ff;font-weight:300;">
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <p style="color:#666;font-size:12px;letter-spacing:1px;margin:0;">VALID FOR 10 MINUTES</p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px 0;">
              <div style="height:1px;background:#1f1f1f;"></div>
            </td>
          </tr>

          <tr>
            <td>
              <p style="color:#555;font-size:11px;margin:0;line-height:1.5;">
                If you didn’t request this, ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

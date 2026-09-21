const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("RESEND_API_KEY não configurada — pulei o envio do e-mail.");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:#F1F1EF;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F1F1EF">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td bgcolor="#153229" style="background-color:#153229;border-radius:16px 16px 0 0;padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:#E3A72B;font-weight:bold;padding-bottom:8px;">BEMBOM</td></tr>
<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#F6F1E4;font-weight:bold;line-height:1.3;">A nova semana já está pronta</td></tr>
</table>
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#22241F;padding-bottom:24px;">
A prévia do cardápio da próxima semana já está disponível — dá tempo de organizar as compras com antecedência antes de ela entrar em vigor na segunda-feira.
</td></tr>
<tr><td align="center" style="padding-bottom:8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="#1F4A3D" style="background-color:#1F4A3D;border-radius:100px;">
<a href="https://caiomarischka.github.io/bembom/" style="display:block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Ver o cardápio</a>
</td></tr>
</table>
</td></tr>
<tr><td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#68695F;padding-top:16px;">
caiomarischka.github.io/bembom
</td></tr>
</table>
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border-radius:0 0 16px 16px;padding:0 32px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid #E1E1DC;padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#68695F;">
Bembom — plano alimentar da família, atualizado automaticamente toda semana.
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const text = `A prévia da próxima semana já está disponível no Bembom.

Dá uma olhada no cardápio e na lista de compras antes de ela entrar em vigor:
https://caiomarischka.github.io/bembom/

— Bembom`;

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Bembom <bembom@mail.caiommateus.com.br>",
    to: ["caiohe@yahoo.com.br"],
    subject: "🥗 A nova semana já está no Bembom",
    html,
    text,
  }),
});

if (!res.ok) {
  console.error("Falha ao enviar e-mail:", res.status, await res.text());
  process.exit(1);
}

console.log("E-mail de aviso enviado com sucesso.");

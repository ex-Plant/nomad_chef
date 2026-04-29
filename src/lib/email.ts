type SendEmailArgsT = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(args: SendEmailArgsT): Promise<void> {
  console.log("[email:stub]", JSON.stringify(args, null, 2));
}

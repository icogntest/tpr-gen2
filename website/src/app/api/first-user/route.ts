import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import {z} from 'zod';

const UserSchema = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().trim().min(8).max(100),
  name: z.string().trim().min(4).max(50),
});

type User = z.infer<typeof UserSchema>;

export async function POST(req: Request) {
  // Fail if we have any users already.
  const numUsersInDb = await prisma.user.count();
  if (numUsersInDb > 0) {
    return new Response(JSON.stringify({error: 'Denied'}));
  }

  const body: User = await req.json();

  // const { success, error, data } = UserSchema.safeParse(body);
  const result = UserSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({error: result.error}));
  }

  const data = result.data;

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: await bcrypt.hash(data.password, 12),
      name: data.name,
    },
  });

  const {password: _password, id: _id, ...safeUser} = user;
  return new Response(JSON.stringify({data: safeUser}));
}

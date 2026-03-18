declare namespace Express {
  interface User {
    id?: string;
    userId: string;
    username: string;
    email: string;
    googleId?: string | null;
    password?: string | null;
    imageId?: string | null;
    tokenVersion?: number;
   
  }

  interface Request {
    user?: User;
  }
}

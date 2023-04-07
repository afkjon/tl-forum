# define!

This is a project that allows users to search for definitions of words. The project is built using the [T3 Stack](https://create.t3.gg/), which includes TypeScript, Tailwind CSS, and tRPC. The live demo can be found [here](https://we-define.vercel.app/).

## Getting Started

To get started with the project, first clone the repository and install the dependencies:

```console
git clone <repo-url>
cd t3-definition-project
npm install
```

Next, you'll need to create a .env file in the root directory with the following contents:

```env
NEXTAUTH_URL=<your-url>
NEXT_PUBLIC_API_URL=<your-api-url>

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>

UPSTASH_REDIS_REST_URL=<your-url>
UPSTASH_REDIS_REST_TOKEN=<your-token>

ADMIN_ID=<your-user-id-from-clerk>
```

You can get the values for the environment variables from the [Clerk dashboard](https://dashboard.clerk.dev/) and [Upstash](https://upstash.com/).

Finally, run the development server:

```console
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

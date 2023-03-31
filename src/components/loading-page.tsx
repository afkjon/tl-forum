import { LoadingSpinner } from "./loading";

export  const LoadingPage = () => {
  return (
    <div className="absolute top-0 right-0 flex h-screen w-screen justify-center align-middle">
      <LoadingSpinner />
    </div>
  );
}

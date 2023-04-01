import { LoadingSpinner } from "./loading";

export const LoadingPage = () => {
  return (
    <div className="flex mx-auto justify-center p-10">
      <LoadingSpinner size={150} />
    </div>
  );
}

import { Suspense } from "react";
import VerifyPage from "./VerifyPage";


export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <VerifyPage />
    </Suspense>
  );
}
import { Separator } from "@/components/ui/separator";

const Billing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>
      <Separator />

  <div className="w-full">
  <div className="mt-0">
    <h1 className="text-xl font-semibold mb-3">
      Premium Features 🔒
    </h1>

    <p className="text-base mb-3 text-gray-600">
      Advanced billing features are available in the premium version of this application.
    </p>

    <ul className="list-disc pl-5 text-base mb-4 space-y-1">
      <li>Free trial with smooth onboarding</li>
      <li>Monthly & yearly subscription plans</li>
      <li>Switch plans anytime</li>
      <li>Manage & cancel subscriptions easily</li>
      <li>Secure Stripe integration</li>
      <li>Production-ready setup</li>
    </ul>

    <div className="bg-gray-100 p-4 rounded-xl text-sm text-gray-700">
      🚧 This feature is currently not enabled in your version.
    </div>
  </div>
</div>
    </div>
  );
};

export default Billing;

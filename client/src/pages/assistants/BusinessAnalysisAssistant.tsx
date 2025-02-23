import { useLanguage } from '@/lib/i18n';

export default function BusinessAnalysisAssistant() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Business Analysis Assistant
      </h1>
      <div className="border rounded-lg p-4">
        {/* AI Assistant implementation will go here */}
      </div>
    </div>
  );
}

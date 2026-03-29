import Button from './Button';

export default function StepForm({ steps, currentStep, onNext, onPrev, isLast, loading }) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
        <Button 
          variant="ghost" 
          onClick={onPrev} 
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button 
          variant={isLast ? 'secondary' : 'primary'}
          onClick={onNext}
          loading={loading}
        >
          {isLast ? 'Get Analysis' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
}

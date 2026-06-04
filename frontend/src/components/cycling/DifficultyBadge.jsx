import { DIFFICULTY_CONFIG } from '../../data/cyclingMockData';

const DifficultyBadge = ({ difficulty, size = 'md', showLabel = true }) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.beginner;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bgLight} ${config.textColor} ${config.borderColor} border ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {showLabel && config.label}
    </span>
  );
};

export default DifficultyBadge;
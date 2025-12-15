import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  iconColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-primary-500',
}) => {
  return (
    <div className="p-5 bg-bg-card rounded-xl shadow-base border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text-subtle uppercase">
          {title}
        </p>
        <Icon size={20} className={`${iconColor} opacity-70`} />
      </div>
      <div className="text-4xl font-extrabold text-text-main">
        {value}
      </div>
      <p className="text-sm text-text-subtle mt-1">{unit}</p>
    </div>
  );
};

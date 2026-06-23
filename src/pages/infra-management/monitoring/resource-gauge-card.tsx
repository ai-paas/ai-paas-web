import { GaugeChart } from '@/components/ui/gauge-chart';
import styles from './resource-gauge-card.module.scss';

type ResourceGaugeCardProps = {
  name: string;
  gauge: number;
  value: string;
  usage: string;
};

export const ResourceGaugeCard = ({ name, gauge, value, usage }: ResourceGaugeCardProps) => (
  <GaugeChart
    value={gauge}
    startAngle={90}
    endAngle={-270}
    color="blue"
    className={styles.resourceGaugeCard}
  >
    <div className={styles.resourceGaugeCenter}>
      <div className={styles.gaugeLabel}>{name}</div>
      <div className={styles.gaugeValue}>{value}</div>
      <div className={styles.gaugeUsage}>{usage}</div>
    </div>
  </GaugeChart>
);

import { BreadCrumb } from '@innogrid/ui';
import { IconChkGreen, IconErrRed } from '../../../assets/img/icon';
import styles from '../learning.module.scss';
import { useNavigate, useParams } from 'react-router';
import { EditLearningButton } from '../../../components/features/learning/edit-learning-button';
import { DeleteLearningButton } from '../../../components/features/learning/delete-learning-button';
import { ModelRegisterButton } from '../../../components/features/learning/model-register-button';
import { useGetLearning } from '@/hooks/service/learning';
import { formatDateTime, formatElapsed } from '@/util/date';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function formatMetric(value?: number, suffix = ''): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return `${value}${suffix}`;
}

function isLearningFailed(status?: string): boolean {
  return !!status && /fail|error/i.test(status);
}

function isLearningFinished(status?: string): boolean {
  return !!status && /complete|success|finish|done/i.test(status);
}

export default function LearningDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { learning } = useGetLearning(Number(id));

  const failed = isLearningFailed(learning?.status);
  const finished = isLearningFinished(learning?.status);

  return (
    <main>
      <div className="breadcrumbBox">
        <BreadCrumb
          items={[{ label: '학습', path: '/learning' }, { label: learning?.name ?? '' }]}
          onNavigate={navigate}
        />
      </div>
      <div className="page-title-box">
        <h2 className="page-title">학습 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <EditLearningButton experimentId={Number(id)} />
            <DeleteLearningButton experimentId={Number(id)} />
            <ModelRegisterButton experimentId={Number(id)} />
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        <h3 className="page-detail-title">상세 정보</h3>
        <div className="page-detail-list-box">
          <ul className="page-detail-list">
            {(finished || failed) && (
              <li>
                <div className="page-detail_item-data">
                  {finished && (
                    <div className={`${styles.conditionBox} ${styles.finish}`}>
                      <IconChkGreen />
                      <span>학습이 정상적으로 완료되었습니다.</span>
                    </div>
                  )}
                  {failed && (
                    <div className={`${styles.conditionBox} ${styles.fail}`}>
                      <IconErrRed />
                      <span>{learning?.train_msg ?? '학습이 실패하였습니다.'}</span>
                    </div>
                  )}
                </div>
              </li>
            )}
            <li>
              <div className="page-detail_item-name">이름</div>
              <div className="page-detail_item-data">{learning?.name ?? '-'}</div>
            </li>
            <li>
              <div className="page-detail_item-name">생성일시</div>
              <div className="page-detail_item-data">
                {learning?.created_at ? formatDateTime(learning.created_at) : '-'}
              </div>
            </li>
            <li>
              <div className="page-detail_item-name">경과 시간</div>
              <div className="page-detail_item-data">{formatElapsed(learning?.elapsed_time)}</div>
            </li>
            <li>
              <div className="page-detail_item-name">배포 서비스</div>
              <div className="page-detail_item-data">-</div>
            </li>
            <li>
              <div className="page-detail_item-name">설명</div>
              <div className="page-detail_item-data">{learning?.description ?? '-'}</div>
            </li>
          </ul>
        </div>
      </div>
      <div className="page-content page-content-detail">
        <h3 className="page-detail-title">학습 결과</h3>
        <div className="page-content-detail-col2">
          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Accuracy</div>
              <div className="page-detail-round-data page-h-75">
                <em>{formatMetric(learning?.accuracy, '%')}</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Precision</div>
              <div className="page-detail-round-data page-h-75">
                <em>{formatMetric(learning?.precision, '%')}</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Recall</div>
              <div className="page-detail-round-data page-h-75">
                <em>{formatMetric(learning?.recall, '%')}</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Average Precision</div>
              <div className="page-detail-round-data page-h-75">
                <em>{formatMetric(learning?.average_precision)}</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Loss</div>
              <div className="page-detail-round-data page-h-75">
                <em>{formatMetric(learning?.loss)}</em>
              </div>
            </div>
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Epochs</div>
              <div className="page-detail-round-data page-h-75">
                <em>
                  {learning?.max_epoch
                    ? `${learning.current_epoch ?? 0} / ${learning.max_epoch}`
                    : '-'}
                </em>
              </div>
            </div>
          </div>
          <div className="page-content-detail-row2">
            <div className="page-detail-round-box page-flex-1">
              <div className="page-detail-round-name">Loss</div>
              <div className="page-detail-round-data page-h-400">
                {learning?.loss_history && learning.loss_history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={learning.loss_history}
                      margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="epoch"
                        label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="loss"
                        stroke="#3385ff"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <em>-</em>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

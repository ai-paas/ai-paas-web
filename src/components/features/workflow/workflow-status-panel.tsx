import { Button } from '@innogrid/ui';
import { useGetWorkflowStatus } from '@/hooks/service/workflows';

interface WorkflowStatusPanelProps {
  workflowId?: string;
}

const EMPTY_VALUE = '-';

export const WorkflowStatusPanel = ({ workflowId }: WorkflowStatusPanelProps) => {
  const { workflowStatus, isPending, isError, isDeploying, refetch } = useGetWorkflowStatus(
    workflowId,
    {
      enabled: !!workflowId,
      polling: true,
    }
  );

  const deployedModels = workflowStatus?.deployed_models ?? [];

  return (
    <div className="tabs-Content">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">배포 상태</div>
          <div className="mt-1 text-sm text-gray-500">
            {isDeploying
              ? '배포 진행 중입니다. 7초 간격으로 상태를 확인합니다.'
              : '최근 배포 상태입니다.'}
          </div>
        </div>
        <Button
          size="medium"
          color="secondary"
          disabled={!workflowId || isPending}
          onClick={() => refetch()}
        >
          새로고침
        </Button>
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center">Loading status...</div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center">
          배포 상태를 불러오지 못했습니다.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">워크플로우 상태</div>
              <div className="mt-1 font-semibold">{workflowStatus?.status ?? EMPTY_VALUE}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Kubeflow Run ID</div>
              <div className="mt-1 font-semibold break-all">
                {workflowStatus?.kubeflow_run_id ?? EMPTY_VALUE}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">배포 모델 수</div>
              <div className="mt-1 font-semibold">{deployedModels.length}</div>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">모델</th>
                  <th className="p-2 text-left">배포 유형</th>
                  <th className="p-2 text-left">상태</th>
                  <th className="p-2 text-left">서비스</th>
                  <th className="p-2 text-left">오류</th>
                </tr>
              </thead>
              <tbody>
                {deployedModels.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center" colSpan={5}>
                      배포 모델 상태가 없습니다.
                    </td>
                  </tr>
                ) : (
                  deployedModels.map((model) => (
                    <tr className="border-b" key={model.component_id}>
                      <td className="p-2">{model.model_name || EMPTY_VALUE}</td>
                      <td className="p-2">{model.deployment_type || EMPTY_VALUE}</td>
                      <td className="p-2">{model.status || EMPTY_VALUE}</td>
                      <td className="p-2 break-all">{model.service_name || EMPTY_VALUE}</td>
                      <td className="p-2 break-all">{model.error_message || EMPTY_VALUE}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

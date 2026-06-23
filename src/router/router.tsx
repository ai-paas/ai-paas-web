import { Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import DefaultLayout from '../pages/layout';
import ServicePage from '../pages/service/page';
import ServiceDetailPage from '../pages/service/[id]/page';
import WorkflowPage from '../pages/workflow/workflow/page';
import WorkflowCreatePage from '../pages/workflow/workflow/create/page';
import WorkflowDetailPage from '../pages/workflow/workflow/[id]/page';
import WorkflowEditPage from '../pages/workflow/workflow/[id]/edit/page';
import WorkflowTemplatePage from '../pages/workflow/templates/page';
import WorkflowTemplateCreatePage from '../pages/workflow/templates/create/page';
import WorkflowTemplateDetailPage from '../pages/workflow/templates/[id]/page';
import WorkflowTemplateEditPage from '../pages/workflow/templates/[id]/edit/page';
import ModelCatalogPage from '../pages/model/model-catalog/page';
import ModelCatalogCreatePage from '../pages/model/model-catalog/create/page';
import ModelCatalogDetailPage from '../pages/model/model-catalog/[id]/page';
import CustomModelCreateHuggingfacePage from '@/pages/model/custom-model/create/huggingface/page';
import CustomModelCreateKagglePage from '@/pages/model/custom-model/create/kaggle/page';
import CustomModelPage from '../pages/model/custom-model/page';
import CustomModelCreatePage from '../pages/model/custom-model/create/page';
import CustomModelDetailPage from '../pages/model/custom-model/[id]/page';
import DatasetPage from '../pages/dataset/page';
import DatasetCreatePage from '../pages/dataset/create/page';
import DatasetDetailPage from '../pages/dataset/[id]/page';
import KnowledgeBasePage from '../pages/knowledge-base/page';
import KnowledgeBaseCreatePage from '../pages/knowledge-base/create/page';
import KnowledgeBaseDetailPage from '../pages/knowledge-base/[id]/page';
import PromptPage from '../pages/prompt/page';
import PromptCreatePage from '../pages/prompt/create/page';
import PromptDetailPage from '../pages/prompt/[id]/page';
import LearningPage from '../pages/learning/page';
import LearningCreatePage from '../pages/learning/create/page';
import LearningDetailPage from '../pages/learning/[id]/page';
import DashboardPage from '../pages/dashboard/page';
import ClusterManagementPage from '../pages/infra-management/cluster-management/page';
import ClusterCreatePage from '../pages/infra-management/cluster-management/create/page';
import ClusterEditPage from '../pages/infra-management/cluster-management/edit/page';
import ClusterDetailPage from '../pages/infra-management/cluster-management/[id]/page';
import ClusterAddonsPage from '../pages/infra-management/cluster-management/[id]/addons/page';
import ClusterAgentFleetPage from '../pages/infra-management/cluster-agent/page';
import CredentialsPage from '../pages/infra-management/credentials/page';
import CredentialsCreatePage from '../pages/infra-management/credentials/create/page';
import AuditLogsPage from '../pages/infra-management/audit-logs/page';
import OperationsPage from '../pages/infra-management/operations/page';
import ProvisioningPage from '../pages/infra-management/provisioning/page';
import ProvisioningCreatePage from '../pages/infra-management/provisioning/create/page';
import VmDetailPage from '../pages/infra-management/provisioning/[id]/page';
import MonitoringPage from '../pages/infra-management/monitoring/page';
import WorkloadPage from '../pages/infra-management/workload/page';
import AcceleratorPage from '../pages/infra-management/accelerator/page';
import UsagePage from '../pages/infra-management/usage/page';
import ApplicationCatalogPage from '../pages/infra-management/application/catalog/page';
import CatalogDetailPage from '../pages/infra-management/application/catalog/[chartName]/page';
import ApplicationHelmReleasePage from '../pages/infra-management/application/helm-release/page';
import HelmReleaseCreatePage from '../pages/infra-management/application/helm-release/create/page';
import HelmReleaseDetailPage from '../pages/infra-management/application/helm-release/[namespace]/[name]/page';
import ApplicationHelmRepositoryPage from '../pages/infra-management/application/helm-repository/page';
import MemberManagementPage from '../pages/member-management/page';
import LearningAssignmentStep2Page from '../pages/learning/assignment/step2/page';
import LearningAssignmentStep3Page from '../pages/learning/assignment/step3/page';
import LearningAssignmentStep5Page from '../pages/learning/assignment/step5/page';
import LearningSolutionStep2Page from '../pages/learning/solution/step2/page';
import MemberManagementDetailPage from '../pages/member-management/[id]/page';
import LoginPage from '../pages/login/page';
import HomePage from '../pages/page';
import MemberCreatePage from '@/pages/member-management/create/page';
import MemberEditPage from '@/pages/member-management/[id]/edit/page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<></>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<></>}>
        <DefaultLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<></>}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'service',
        element: (
          <Suspense fallback={<></>}>
            <ServicePage />
          </Suspense>
        ),
      },
      {
        path: 'service/:id',
        element: (
          <Suspense fallback={<></>}>
            <ServiceDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'workflow',
        children: [
          {
            index: true,
            element: <Navigate to="workflow" replace />,
          },
          {
            path: 'workflow',
            index: true,
            element: (
              <Suspense fallback={<></>}>
                <WorkflowPage />
              </Suspense>
            ),
          },
          {
            path: 'templates',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowTemplatePage />
              </Suspense>
            ),
          },
          {
            path: 'templates/create',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowTemplateCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'templates/:id',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowTemplateDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'templates/:id/edit',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowTemplateEditPage />
              </Suspense>
            ),
          },
          {
            path: 'workflow/create',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'workflow/:id',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'workflow/:id/edit',
            element: (
              <Suspense fallback={<></>}>
                <WorkflowEditPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'model',
        children: [
          {
            path: 'model-catalog',
            index: true,
            element: (
              <Suspense fallback={<></>}>
                <ModelCatalogPage />
              </Suspense>
            ),
          },
          {
            path: 'model-catalog/create',
            element: (
              <Suspense fallback={<></>}>
                <ModelCatalogCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'model-catalog/:id',
            index: true,
            element: (
              <Suspense fallback={<></>}>
                <ModelCatalogDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'custom-model',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelPage />
              </Suspense>
            ),
          },
          {
            path: 'custom-model/create',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelCreatePage />
              </Suspense>
            ),
          },
          {
            path: 'custom-model/create/huggingface',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelCreateHuggingfacePage />
              </Suspense>
            ),
          },
          {
            path: 'custom-model/create/kaggle',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelCreateKagglePage />
              </Suspense>
            ),
          },
          {
            path: 'custom-model/:id',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'dataset',
        element: (
          <Suspense fallback={<></>}>
            <DatasetPage />
          </Suspense>
        ),
      },
      {
        path: 'dataset/create',
        element: (
          <Suspense fallback={<></>}>
            <DatasetCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'dataset/:id',
        element: (
          <Suspense fallback={<></>}>
            <DatasetDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-base',
        element: (
          <Suspense fallback={<></>}>
            <KnowledgeBasePage />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-base/create',
        element: (
          <Suspense fallback={<></>}>
            <KnowledgeBaseCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-base/:id',
        element: (
          <Suspense fallback={<></>}>
            <KnowledgeBaseDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'prompt',
        element: (
          <Suspense fallback={<></>}>
            <PromptPage />
          </Suspense>
        ),
      },
      {
        path: 'prompt/create',
        element: (
          <Suspense fallback={<></>}>
            <PromptCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'prompt/:id',
        element: (
          <Suspense fallback={<></>}>
            <PromptDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'learning',
        element: (
          <Suspense fallback={<></>}>
            <LearningPage />
          </Suspense>
        ),
      },
      {
        path: 'learning/create',
        element: (
          <Suspense fallback={<></>}>
            <LearningCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'learning/:id',
        element: (
          <Suspense fallback={<></>}>
            <LearningDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'learning/assignment/step2',
        element: (
          <Suspense fallback={<></>}>
            <LearningAssignmentStep2Page />
          </Suspense>
        ),
      },
      {
        path: 'learning/assignment/step3',
        element: (
          <Suspense fallback={<></>}>
            <LearningAssignmentStep3Page />
          </Suspense>
        ),
      },
      {
        path: 'learning/assignment/step5',
        element: (
          <Suspense fallback={<></>}>
            <LearningAssignmentStep5Page />
          </Suspense>
        ),
      },
      {
        path: 'learning/solution/step2',
        element: (
          <Suspense fallback={<></>}>
            <LearningSolutionStep2Page />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<></>}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'infra-management',
        children: [
          {
            path: 'cluster-management',
            children: [
              {
                index: true,
                element: <ClusterManagementPage />,
              },
              {
                path: 'create',
                element: <ClusterCreatePage />,
              },
              {
                path: 'edit/:clusterId',
                element: <ClusterEditPage />,
              },
              {
                path: ':id',
                element: <ClusterDetailPage />,
              },
              {
                path: ':id/addons',
                element: <ClusterAddonsPage />,
              },
            ],
          },
          {
            path: 'credentials',
            element: <CredentialsPage />,
          },
          {
            path: 'credentials/create',
            element: <CredentialsCreatePage />,
          },
          {
            path: 'audit-logs',
            element: <AuditLogsPage />,
          },
          {
            path: 'operations',
            element: <OperationsPage />,
          },
          {
            path: 'cluster-agent',
            element: <ClusterAgentFleetPage />,
          },
          {
            path: 'provisioning',
            element: <ProvisioningPage />,
          },
          {
            path: 'provisioning/create',
            element: <ProvisioningCreatePage />,
          },
          {
            path: 'provisioning/:id',
            element: <VmDetailPage />,
          },
          {
            path: 'monitoring',
            element: <MonitoringPage />,
          },
          {
            path: 'workload',
            element: <WorkloadPage />,
          },
          {
            path: 'accelerator',
            element: <AcceleratorPage />,
          },
          {
            path: 'usage',
            element: <UsagePage />,
          },
          {
            path: 'application',
            children: [
              {
                path: 'catalog',
                index: true,
                element: <ApplicationCatalogPage />,
              },
              {
                path: 'catalog/:chartName',
                element: <CatalogDetailPage />,
              },
              {
                path: 'helm-release',
                element: <ApplicationHelmReleasePage />,
              },
              {
                path: 'helm-release/create',
                element: <HelmReleaseCreatePage />,
              },
              {
                path: 'helm-release/:namespace/:name',
                element: <HelmReleaseDetailPage />,
              },
              {
                path: 'helm-repository',
                element: <ApplicationHelmRepositoryPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'member-management',
        element: (
          <Suspense fallback={<></>}>
            <MemberManagementPage />
          </Suspense>
        ),
      },
      {
        path: 'member-management/:id',
        element: (
          <Suspense fallback={<></>}>
            <MemberManagementDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'member-management/create',
        element: (
          <Suspense fallback={<></>}>
            <MemberCreatePage />
          </Suspense>
        ),
      },
      {
        path: 'member-management/:id/edit',
        element: (
          <Suspense fallback={<></>}>
            <MemberEditPage />
          </Suspense>
        ),
      },
    ],
  },
]);

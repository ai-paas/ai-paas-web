import { createBrowserRouter } from 'react-router';
import DefaultLayout from '../pages/layout';
import ServicePage from '../pages/service/page';
import ServiceDetailPage from '../pages/service/[id]/page';
import WorkflowPage from '../pages/workflow/page';
import WorkflowCreatePage from '../pages/workflow/create/page';
import WorkflowDetailPage from '../pages/workflow/[id]/page';
import WorkflowEditPage from '../pages/workflow/[id]/edit/page';
import ModelCatalogPage from '../pages/model/model-catalog/page';
import ModelCatalogCreatePage from '../pages/model/model-catalog/create/page';
import ModelCatalogDetailPage from '../pages/model/model-catalog/[id]/page';
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
import EventPage from '../pages/infra-management/event/page';
import ClusterManagementPage from '../pages/infra-management/cluster-management/page';
import MonitoringDashboardPage from '../pages/infra-management/monitoring-dashboard/page';
import ApplicationCatalogPage from '../pages/infra-management/application/catalog/page';
import ApplicationHelmReleasePage from '../pages/infra-management/application/helm-release/page';
import ApplicationHelmRepositoryPage from '../pages/infra-management/application/helm-repository/page';
import MemberManagementPage from '../pages/member-management/page';
import LearningAssignmentStep2Page from '../pages/learning/assignment/step2/page';
import LearningAssignmentStep3Page from '../pages/learning/assignment/step3/page';
import LearningAssignmentStep5Page from '../pages/learning/assignment/step5/page';
import LearningSolutionStep2Page from '../pages/learning/solution/step2/page';
import MemberManagementDetailPage from '../pages/member-management/[id]/page';
import LoginPage from '../pages/login/page';
import HomePage from '../pages/page';
import CustomModelCreateHuggingfacePage from '@/pages/model/custom-model/create/huggingface/page';
import CustomModelCreateEtriPage from '@/pages/model/custom-model/create/etri/page';
import MemberCreatePage from '@/pages/member-management/create/page';
import MemberEditPage from '@/pages/member-management/[id]/edit/page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'service',
        element: <ServicePage />,
      },
      {
        path: 'service/:id',
        element: <ServiceDetailPage />,
      },
      {
        path: 'workflow',
        element: <WorkflowPage />,
      },
      {
        path: 'workflow/create',
        element: <WorkflowCreatePage />,
      },
      {
        path: 'workflow/:id',
        element: <WorkflowDetailPage />,
      },
      {
        path: 'workflow/:id/edit',
        element: <WorkflowEditPage />,
      },
      {
        path: 'model',
        children: [
          {
            path: 'model-catalog',
            index: true,
            element: <ModelCatalogPage />,
          },
          {
            path: 'model-catalog/create',
            element: <ModelCatalogCreatePage />,
          },
          {
            path: 'model-catalog/:id',
            index: true,
            element: <ModelCatalogDetailPage />,
          },
          {
            path: 'custom-model',
            element: <CustomModelPage />,
          },
          {
            path: 'custom-model/create',
            element: <CustomModelCreatePage />,
          },
          {
            path: 'custom-model/create/huggingface',
            element: <CustomModelCreateHuggingfacePage />,
          },
          {
            path: 'custom-model/create/etri',
            element: <CustomModelCreateEtriPage />,
          },
          {
            path: 'custom-model/:id',
            element: <CustomModelDetailPage />,
          },
        ],
      },
      {
        path: 'dataset',
        element: <DatasetPage />,
      },
      {
        path: 'dataset/create',
        element: <DatasetCreatePage />,
      },
      {
        path: 'dataset/:id',
        element: <DatasetDetailPage />,
      },
      {
        path: 'knowledge-base',
        element: <KnowledgeBasePage />,
      },
      {
        path: 'knowledge-base/create',
        element: <KnowledgeBaseCreatePage />,
      },
      {
        path: 'knowledge-base/:id',
        element: <KnowledgeBaseDetailPage />,
      },
      {
        path: 'prompt',
        element: <PromptPage />,
      },
      {
        path: 'prompt/create',
        element: <PromptCreatePage />,
      },
      {
        path: 'prompt/:id',
        element: <PromptDetailPage />,
      },
      {
        path: 'learning',
        element: <LearningPage />,
      },
      {
        path: 'learning/create',
        element: <LearningCreatePage />,
      },
      {
        path: 'learning/:id',
        element: <LearningDetailPage />,
      },
      {
        path: 'learning/assignment/step2',
        element: <LearningAssignmentStep2Page />,
      },
      {
        path: 'learning/assignment/step3',
        element: <LearningAssignmentStep3Page />,
      },
      {
        path: 'learning/assignment/step5',
        element: <LearningAssignmentStep5Page />,
      },
      {
        path: 'learning/solution/step2',
        element: <LearningSolutionStep2Page />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'infra-management',
        children: [
          {
            path: 'cluster-management',
            index: true,
            element: <ClusterManagementPage />,
          },
          {
            path: 'monitoring-dashboard',
            element: <MonitoringDashboardPage />,
          },
          {
            path: 'event',
            element: <EventPage />,
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
                path: 'helm-release',
                element: <ApplicationHelmReleasePage />,
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
        element: <MemberManagementPage />,
      },
      {
        path: 'member-management/:id',
        element: <MemberManagementDetailPage />,
      },
      {
        path: 'member-management/create',
        element: <MemberCreatePage />,
      },
      {
        path: 'member-management/:id/edit',
        element: <MemberEditPage />,
      },
    ],
  },
]);

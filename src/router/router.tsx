import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

const DefaultLayout = lazy(() => import('../pages/layout'));
const ServicePage = lazy(() => import('../pages/service/page'));
const ServiceDetailPage = lazy(() => import('../pages/service/[id]/page'));
const WorkflowPage = lazy(() => import('../pages/workflow/page'));
const WorkflowCreatePage = lazy(() => import('../pages/workflow/create/page'));
const WorkflowDetailPage = lazy(() => import('../pages/workflow/[id]/page'));
const WorkflowEditPage = lazy(() => import('../pages/workflow/[id]/edit/page'));
const ModelCatalogPage = lazy(() => import('../pages/model/model-catalog/page'));
const ModelCatalogCreatePage = lazy(() => import('../pages/model/model-catalog/create/page'));
const ModelCatalogDetailPage = lazy(() => import('../pages/model/model-catalog/[id]/page'));
const CustomModelPage = lazy(() => import('../pages/model/custom-model/page'));
const CustomModelCreatePage = lazy(() => import('../pages/model/custom-model/create/page'));
const CustomModelDetailPage = lazy(() => import('../pages/model/custom-model/[id]/page'));
const DatasetPage = lazy(() => import('../pages/dataset/page'));
const DatasetCreatePage = lazy(() => import('../pages/dataset/create/page'));
const DatasetDetailPage = lazy(() => import('../pages/dataset/[id]/page'));
const KnowledgeBasePage = lazy(() => import('../pages/knowledge-base/page'));
const KnowledgeBaseCreatePage = lazy(() => import('../pages/knowledge-base/create/page'));
const KnowledgeBaseDetailPage = lazy(() => import('../pages/knowledge-base/[id]/page'));
const PromptPage = lazy(() => import('../pages/prompt/page'));
const PromptCreatePage = lazy(() => import('../pages/prompt/create/page'));
const PromptDetailPage = lazy(() => import('../pages/prompt/[id]/page'));
const LearningPage = lazy(() => import('../pages/learning/page'));
const LearningCreatePage = lazy(() => import('../pages/learning/create/page'));
const LearningDetailPage = lazy(() => import('../pages/learning/[id]/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const EventPage = lazy(() => import('../pages/infra-management/event/page'));
const ClusterManagementPage = lazy(
  () => import('../pages/infra-management/cluster-management/page')
);
const MonitoringDashboardPage = lazy(
  () => import('../pages/infra-management/monitoring-dashboard/page')
);
const ApplicationCatalogPage = lazy(
  () => import('../pages/infra-management/application/catalog/page')
);
const ApplicationHelmReleasePage = lazy(
  () => import('../pages/infra-management/application/helm-release/page')
);
const ApplicationHelmRepositoryPage = lazy(
  () => import('../pages/infra-management/application/helm-repository/page')
);
const MemberManagementPage = lazy(() => import('../pages/member-management/page'));
const LearningAssignmentStep2Page = lazy(() => import('../pages/learning/assignment/step2/page'));
const LearningAssignmentStep3Page = lazy(() => import('../pages/learning/assignment/step3/page'));
const LearningAssignmentStep5Page = lazy(() => import('../pages/learning/assignment/step5/page'));
const LearningSolutionStep2Page = lazy(() => import('../pages/learning/solution/step2/page'));
const MemberManagementDetailPage = lazy(() => import('../pages/member-management/[id]/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const HomePage = lazy(() => import('../pages/page'));
const CustomModelCreateHuggingfacePage = lazy(
  () => import('@/pages/model/custom-model/create/huggingface/page')
);
const CustomModelCreateEtriPage = lazy(() => import('@/pages/model/custom-model/create/etri/page'));
const MemberCreatePage = lazy(() => import('@/pages/member-management/create/page'));
const MemberEditPage = lazy(() => import('@/pages/member-management/[id]/eidt/page'));

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
        element: (
          <Suspense fallback={<></>}>
            <WorkflowPage />
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
            path: 'custom-model/create/etri',
            element: (
              <Suspense fallback={<></>}>
                <CustomModelCreateEtriPage />
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
            index: true,
            element: <ClusterManagementPage />,
          },
          {
            path: 'monitoring-dashboard',
            element: (
              <Suspense fallback={<></>}>
                <MonitoringDashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'event',
            element: (
              <Suspense fallback={<></>}>
                <EventPage />
              </Suspense>
            ),
          },
          {
            path: 'application',
            children: [
              {
                path: 'catalog',
                index: true,
                element: (
                  <Suspense fallback={<></>}>
                    <ApplicationCatalogPage />
                  </Suspense>
                ),
              },
              {
                path: 'helm-release',
                element: (
                  <Suspense fallback={<></>}>
                    <ApplicationHelmReleasePage />
                  </Suspense>
                ),
              },
              {
                path: 'helm-repository',
                element: (
                  <Suspense fallback={<></>}>
                    <ApplicationHelmRepositoryPage />
                  </Suspense>
                ),
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

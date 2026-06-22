import { Link, useLocation } from 'react-router';
import {
  IconDashboard,
  IconDataset,
  IconInfraManagement,
  IconKnowledgeBase,
  IconLearning,
  IconMemberManagement,
  IconModel,
  IconPrompt,
  IconService,
  IconWorkflow,
} from '@/assets/img/nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const isPathActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

export const Menu = () => {
  const location = useLocation();

  return (
    <ul>
      <MenuItem
        icon={<IconService />}
        label="서비스"
        href="/service"
        isActive={isPathActive(location.pathname, '/service')}
      />
      <MenuItem
        icon={<IconWorkflow />}
        label="워크플로우"
        isActive={isPathActive(location.pathname, '/workflow')}
      >
        <ul>
          <MenuItem2
            label="워크플로우"
            href="/workflow/workflow"
            isActive={isPathActive(location.pathname, '/workflow/workflow')}
          />
          <MenuItem2
            label="워크플로우 템플릿"
            href="/workflow/templates"
            isActive={isPathActive(location.pathname, '/workflow/templates')}
          />
        </ul>
      </MenuItem>
      <MenuItem
        icon={<IconModel />}
        label="모델"
        isActive={isPathActive(location.pathname, '/model')}
      >
        <ul>
          <MenuItem2
            label="모델 카탈로그"
            href="/model/model-catalog"
            isActive={isPathActive(location.pathname, '/model/model-catalog')}
          />
          <MenuItem2
            label="커스텀 모델"
            href="/model/custom-model"
            isActive={isPathActive(location.pathname, '/model/custom-model')}
          />
        </ul>
      </MenuItem>
      <MenuItem
        icon={<IconDataset />}
        label="데이터셋"
        href="/dataset"
        isActive={isPathActive(location.pathname, '/dataset')}
      />
      <MenuItem
        icon={<IconKnowledgeBase />}
        label="지식 기반"
        href="/knowledge-base"
        isActive={isPathActive(location.pathname, '/knowledge-base')}
      />
      <MenuItem
        icon={<IconPrompt />}
        label="프롬프트"
        href="/prompt"
        isActive={isPathActive(location.pathname, '/prompt')}
      />
      <MenuItem
        icon={<IconLearning />}
        label="학습"
        href="/learning"
        isActive={isPathActive(location.pathname, '/learning')}
      />
      <MenuItem
        icon={<IconDashboard />}
        label="대시보드"
        href="/dashboard"
        isActive={isPathActive(location.pathname, '/dashboard')}
      />
      <MenuItem
        icon={<IconInfraManagement />}
        label="인프라 관리"
        isActive={isPathActive(location.pathname, '/infra-management')}
      >
        <ul>
          <MenuItem2
            label="클러스터"
            href="/infra-management/cluster-management"
            isActive={isPathActive(location.pathname, '/infra-management/cluster-management')}
          />
          <MenuItem2
            label="프로비저닝"
            href="/infra-management/provisioning"
            isActive={isPathActive(location.pathname, '/infra-management/provisioning')}
          />
          <MenuItem2
            label="모니터링"
            href="/infra-management/monitoring"
            isActive={isPathActive(location.pathname, '/infra-management/monitoring')}
          />
          <MenuItem2
            label="GPU"
            isActive={
              isPathActive(location.pathname, '/infra-management/workload') ||
              isPathActive(location.pathname, '/infra-management/accelerator') ||
              isPathActive(location.pathname, '/infra-management/usage')
            }
          >
            <ul>
              <MenuItem3
                label="GPU 워크로드"
                href="/infra-management/workload"
                isActive={isPathActive(location.pathname, '/infra-management/workload')}
              />
              <MenuItem3
                label="가속기"
                href="/infra-management/accelerator"
                isActive={isPathActive(location.pathname, '/infra-management/accelerator')}
              />
              <MenuItem3
                label="사용량"
                href="/infra-management/usage"
                isActive={isPathActive(location.pathname, '/infra-management/usage')}
              />
            </ul>
          </MenuItem2>
          <MenuItem2
            label="애플리케이션"
            isActive={isPathActive(location.pathname, '/infra-management/application')}
          >
            <ul>
              <MenuItem3
                label="카탈로그"
                href="/infra-management/application/catalog"
                isActive={isPathActive(location.pathname, '/infra-management/application/catalog')}
              />
              <MenuItem3
                label="헬름 릴리즈"
                href="/infra-management/application/helm-release"
                isActive={isPathActive(
                  location.pathname,
                  '/infra-management/application/helm-release'
                )}
              />
              <MenuItem3
                label="헬름 저장소"
                href="/infra-management/application/helm-repository"
                isActive={isPathActive(
                  location.pathname,
                  '/infra-management/application/helm-repository'
                )}
              />
            </ul>
          </MenuItem2>
          <MenuItem2
            label="시스템 설정"
            isActive={
              isPathActive(location.pathname, '/infra-management/credentials') ||
              isPathActive(location.pathname, '/infra-management/audit-logs') ||
              isPathActive(location.pathname, '/infra-management/operations') ||
              isPathActive(location.pathname, '/infra-management/cluster-agent')
            }
          >
            <ul>
              <MenuItem3
                label="자격증명"
                href="/infra-management/credentials"
                isActive={isPathActive(location.pathname, '/infra-management/credentials')}
              />
              <MenuItem3
                label="감사 로그"
                href="/infra-management/audit-logs"
                isActive={isPathActive(location.pathname, '/infra-management/audit-logs')}
              />
              <MenuItem3
                label="작업 이력"
                href="/infra-management/operations"
                isActive={isPathActive(location.pathname, '/infra-management/operations')}
              />
              <MenuItem3
                label="에이전트"
                href="/infra-management/cluster-agent"
                isActive={isPathActive(location.pathname, '/infra-management/cluster-agent')}
              />
            </ul>
          </MenuItem2>
        </ul>
      </MenuItem>
      <MenuItem
        icon={<IconMemberManagement />}
        label="멤버 관리"
        href="/member-management"
        isActive={isPathActive(location.pathname, '/member-management')}
      />
    </ul>
  );
};

type MenuItemProps =
  | {
      icon: React.ReactNode;
      label: string;
      href: string;
      isActive?: boolean;
      children?: never;
    }
  | {
      icon: React.ReactNode;
      label: string;
      href?: never;
      isActive?: boolean;
      children: React.ReactNode;
    };

const MenuItem = ({ icon, label, href, isActive = false, children }: MenuItemProps) => {
  if (!children && href) {
    return (
      <li>
        <Link to={href}>
          <div
            className={`relative mb-1 flex h-10 items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? 'bg-[#e8e8e8]' : ''}`}
          >
            <div className={`${isActive ? 'opacity-100' : 'opacity-65'}`}>{icon}</div>
            <div className="ml-1 truncate text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <span className={`${isActive ? 'font-semibold text-[#1a1a1a]' : ''}`}>{label}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Collapsible className="group/collapsible">
        <CollapsibleTrigger asChild>
          <div
            className={`relative mb-1 flex h-10 cursor-pointer items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? 'group-data-[width=52]/sidebar:bg-[#e8e8e8]' : ''}`}
          >
            <div className={`${isActive ? 'opacity-100' : 'opacity-65'}`}>{icon}</div>
            <div className="ml-1 w-full truncate text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <div className="flex w-full items-center justify-between">
                <span className={`${isActive ? 'font-semibold text-[#1a1a1a]' : ''}`}>{label}</span>
                <i
                  className={`mr-1 hidden size-[7px] -translate-y-1/3 rotate-45 border-r border-b group-hover/sidebar:block group-data-[pinned=true]/sidebar:block group-data-[state=open]/collapsible:translate-y-1/3 group-data-[state=open]/collapsible:rotate-[225deg] ${isActive ? 'border-[#1a1a1a]' : 'border-[#999]'}`}
                />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="group-data-[width=52]/sidebar:hidden">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

type MenuItem2Props =
  | {
      label: string;
      href: string;
      isActive?: boolean;
      children?: never;
    }
  | {
      label: string;
      href?: never;
      isActive?: boolean;
      children: React.ReactNode;
    };

const MenuItem2 = ({ label, href, isActive = false, children }: MenuItem2Props) => {
  if (!children && href) {
    return (
      <li>
        <Link to={href}>
          <div
            className={`relative mb-1 flex h-10 items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? 'bg-[#e8e8e8]' : ''}`}
          >
            <div className="ml-1 truncate pl-6 text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <span className={`${isActive ? 'font-semibold text-[#1a1a1a]' : ''}`}>{label}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Collapsible className="group/collapsible2">
        <CollapsibleTrigger asChild>
          <div className="relative mb-1 flex h-10 cursor-pointer items-center rounded-sm p-2 hover:bg-[#e8e8e8]">
            <div className="ml-1 truncate pl-6 text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <span className={`${isActive ? 'font-semibold text-[#1a1a1a]' : ''}`}>{label}</span>
            </div>
            <i
              className={`absolute top-[45%] right-3 size-[7px] -translate-y-1/2 rotate-45 border-r border-b group-hover:block group-data-[state=open]/collapsible2:top-[55%] group-data-[state=open]/collapsible2:rotate-[225deg] ${isActive ? 'border-[#1a1a1a]' : 'border-[#999]'}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </li>
  );
};

type MenuItem3Props = {
  label: string;
  href: string;
  isActive?: boolean;
};

const MenuItem3 = ({ label, href, isActive = false }: MenuItem3Props) => {
  return (
    <li>
      <Link to={href}>
        <div
          className={`relative mb-1 flex h-10 cursor-pointer items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? 'bg-[#e8e8e8]' : ''}`}
        >
          <div className="ml-1 flex items-center truncate pl-6 text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
            <i className={`mr-2 h-[1.5px] w-1.5 ${isActive ? 'bg-[#1a1a1a]' : 'bg-[#B8B8B8]'}`} />
            <span className={`${isActive ? 'font-semibold text-[#1a1a1a]' : ''}`}>{label}</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

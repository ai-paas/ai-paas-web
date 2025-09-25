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

export const Menu = () => {
  const location = useLocation();

  return (
    <ul>
      <MenuItem icon={<IconService />} label="서비스" href="/service" isActive={location.pathname === '/service'} />
      <MenuItem icon={<IconWorkflow />} label="워크플로우" href="/workflow" isActive={location.pathname === '/workflow'} />
      <MenuItem icon={<IconModel />} label="모델" isActive={location.pathname.startsWith('/model')}>
        <ul>
          <MenuItem2 label="모델 카탈로그" href="/model/model-catalog" isActive={location.pathname === '/model/model-catalog'} />
          <MenuItem2 label="커스텀 모델" href="/model/custom-model" isActive={location.pathname === '/model/custom-model'} />
        </ul>
      </MenuItem>
      <MenuItem icon={<IconDataset />} label="데이터셋" href="/dataset" isActive={location.pathname === '/dataset'} />
      <MenuItem icon={<IconKnowledgeBase />} label="지식 기반" href="/knowledge-base" isActive={location.pathname === '/knowledge-base'} />
      <MenuItem icon={<IconPrompt />} label="프롬프트" href="/prompt" isActive={location.pathname === '/prompt'} />
      <MenuItem icon={<IconLearning />} label="학습" href="/learning" isActive={location.pathname === '/learning'} />
      <MenuItem icon={<IconDashboard />} label="대시보드" href="/dashboard" isActive={location.pathname === '/dashboard'} />
      <MenuItem icon={<IconInfraManagement />} label="인프라 관리" isActive={location.pathname.startsWith('/infra-management')}>
        <ul>
          <MenuItem2 label="클러스터 관리" href="/infra-management/cluster-management" isActive={location.pathname === '/infra-management/cluster-management'} />
          <MenuItem2 label="모니터링 대시보드" href="/infra-management/monitoring-dashboard" isActive={location.pathname === '/infra-management/monitoring-dashboard'} />
          <MenuItem2 label="이벤트" href="/infra-management/event" isActive={location.pathname === '/infra-management/event'} />
          <MenuItem2 label="애플리케이션" isActive={location.pathname.startsWith('/infra-management/application')}>
            <ul>
              <MenuItem3 label="카탈로그" href="/infra-management/application/catalog" isActive={location.pathname === '/infra-management/application/catalog'} />
              <MenuItem3 label="헬름 릴리즈" href="/infra-management/application/helm-release" isActive={location.pathname === '/infra-management/application/helm-release'} />
              <MenuItem3 label="헬름 저장소" href="/infra-management/application/helm-repository" isActive={location.pathname === '/infra-management/application/helm-repository'} />
            </ul>
          </MenuItem2>
        </ul>
      </MenuItem>
      <MenuItem icon={<IconMemberManagement />} label="멤버 관리" href="/member-management" isActive={location.pathname === '/member-management'} />
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
          <div className={`relative mb-1 flex h-10 items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? "bg-[#e8e8e8]":""}`}>
            <div className={`${isActive ?"opacity-100":"opacity-65"}`}>{icon}</div>
            <div className="ml-1 truncate text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <span className={`${isActive ? "text-[#1a1a1a] font-semibold" : ""}`}>{label}</span>
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
          <div className={`relative mb-1 flex h-10 cursor-pointer items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? "group-data-[width=52]/sidebar:bg-[#e8e8e8]":""}`}>
            <div className={`${isActive ?"opacity-100":"opacity-65"}`}>{icon}</div>
            <div className="ml-1 w-full truncate text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <div className="flex w-full items-center justify-between">
                <span className={`${isActive ? "text-[#1a1a1a] font-semibold" : ""}`}>{label}</span>
                <i className={`mr-1 hidden size-[7px] -translate-y-1/3 rotate-45 border-r border-b group-hover/sidebar:block group-data-[pinned=true]/sidebar:block group-data-[state=open]/collapsible:rotate-[225deg] group-data-[state=open]/collapsible:translate-y-1/3 ${isActive?"border-[#1a1a1a]":"border-[#999]"}`} />
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
          <div className={`relative mb-1 flex h-10 items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? "bg-[#e8e8e8]":""}`}>
            <div className="ml-1 truncate pl-6 text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
              <span className={`${isActive ? "text-[#1a1a1a] font-semibold" : ""}`}>{label}</span>
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
              <span className={`${isActive ? "text-[#1a1a1a] font-semibold" : ""}`}>{label}</span>
            </div>
            <i
              className={`absolute top-[45%] right-3 size-[7px] -translate-y-1/2 rotate-45 border-r border-b group-hover:block group-data-[state=open]/collapsible2:top-[55%] group-data-[state=open]/collapsible2:rotate-[225deg] ${isActive ? "border-[#1a1a1a]" : "border-[#999]"}`}
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
        <div className={`relative mb-1 flex h-10 cursor-pointer items-center rounded-sm p-2 hover:bg-[#e8e8e8] ${isActive ? "bg-[#e8e8e8]" : ""}`}>
          <div className="ml-1 flex items-center truncate pl-6 text-xs -tracking-[0.5px] text-[#525252] transition-[width_0.6s_ease-in-out]">
            <i className={`mr-2 h-[1.5px] w-1.5 ${isActive ? "bg-[#1a1a1a]" : "bg-[#B8B8B8]"}`} />
            <span className={`${isActive ? "text-[#1a1a1a] font-semibold" : ""}`}>{label}</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

import { FlowChart } from '@/components/ui/flow-chart';
import { Handle, Position, type Edge, type Node } from '@xyflow/react';
import { memo } from 'react';

const StartNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-blue-500 text-white shadow-md">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-3.5"
                data-icon="Home"
                aria-hidden="true"
              >
                <g id="icons/home">
                  <path
                    id="Icon (Stroke)"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.99999 2.44562C6.97241 2.46663 6.94086 2.49116 6.90151 2.52177L3.43971 5.21428C3.17896 5.41708 3.15115 5.44593 3.13396 5.46918C3.10759 5.50483 3.08794 5.545 3.07599 5.58771C3.0682 5.61555 3.0625 5.65522 3.0625 5.98554V9.67837C3.0625 9.97506 3.06301 10.1581 3.07422 10.2954C3.08463 10.4228 3.10101 10.4541 3.10219 10.4563C3.13714 10.5249 3.19296 10.5808 3.26156 10.6157C3.2638 10.6169 3.29514 10.6333 3.42254 10.6437C3.55984 10.6549 3.74289 10.6555 4.03958 10.6555H4.8125V7.53462C4.8125 7.52831 4.81249 7.52199 4.81249 7.51565C4.81247 7.38933 4.81245 7.25834 4.82163 7.14594C4.8319 7.02025 4.85685 6.86124 4.93966 6.69872C5.05151 6.4792 5.22998 6.30072 5.44951 6.18886C5.61203 6.10605 5.77104 6.08111 5.89673 6.07084C6.00913 6.06166 6.14012 6.06168 6.26644 6.0617C6.27278 6.0617 6.2791 6.06171 6.28541 6.06171H7.71458C7.72089 6.06171 7.72721 6.0617 7.73355 6.0617C7.85987 6.06168 7.99086 6.06166 8.10326 6.07084C8.22896 6.08111 8.38796 6.10605 8.55049 6.18886C8.77001 6.30072 8.94849 6.4792 9.06034 6.69872C9.14315 6.86124 9.16809 7.02025 9.17836 7.14594C9.18755 7.25834 9.18752 7.38933 9.1875 7.51565C9.1875 7.52199 9.1875 7.52831 9.1875 7.53462V10.6555H9.96041C10.2571 10.6555 10.4402 10.6549 10.5775 10.6437C10.7049 10.6333 10.7361 10.6169 10.7383 10.6158C10.8069 10.5808 10.8628 10.525 10.8978 10.4564C10.8989 10.4541 10.9154 10.4228 10.9258 10.2954C10.937 10.1581 10.9375 9.97506 10.9375 9.67837V5.98554C10.9375 5.65522 10.9318 5.61555 10.924 5.58771C10.912 5.545 10.8924 5.50483 10.866 5.46918C10.8488 5.44593 10.821 5.41708 10.5603 5.21428L7.09848 2.52177C7.05913 2.49116 7.02757 2.46663 6.99999 2.44562ZM9.98433 11.968C10.2497 11.968 10.4871 11.968 10.6843 11.9519C10.8951 11.9346 11.1172 11.8958 11.3343 11.7852C11.6499 11.6244 11.9064 11.3678 12.0672 11.0523C12.1778 10.8351 12.2167 10.6131 12.2339 10.4023C12.25 10.205 12.25 9.96764 12.25 9.70225L12.25 5.98554C12.25 5.9671 12.25 5.94866 12.2501 5.93025C12.2504 5.69307 12.2508 5.45861 12.1879 5.23392C12.1329 5.03748 12.0426 4.85272 11.9213 4.68871C11.7825 4.50112 11.5972 4.35747 11.4098 4.21216C11.3952 4.20087 11.3806 4.18958 11.3661 4.17826L7.90428 1.48574C7.89214 1.4763 7.87933 1.46621 7.86587 1.4556C7.73357 1.35131 7.53852 1.19755 7.3049 1.1343C7.10523 1.08023 6.89477 1.08023 6.69509 1.1343C6.46148 1.19755 6.26642 1.35131 6.13412 1.4556C6.12066 1.46621 6.10785 1.4763 6.09571 1.48574L2.63391 4.17826C2.61935 4.18958 2.60478 4.20088 2.59022 4.21216C2.40278 4.35747 2.21747 4.50112 2.07873 4.68871C1.95742 4.85271 1.86706 5.03748 1.81207 5.23392C1.74918 5.4586 1.74956 5.69307 1.74994 5.93024C1.74997 5.94866 1.75 5.96709 1.75 5.98554L1.75 9.70227C1.74998 9.96765 1.74997 10.205 1.76608 10.4023C1.78331 10.6131 1.82216 10.8351 1.93279 11.0523C2.09357 11.3678 2.35014 11.6244 2.6657 11.7852C2.88282 11.8958 3.10485 11.9346 3.31566 11.9519C3.5129 11.968 3.75029 11.968 4.01566 11.968H9.98433ZM7.875 10.6555V7.53462C7.875 7.47093 7.87498 7.41945 7.87447 7.37473C7.82975 7.37422 7.77828 7.37421 7.71458 7.37421H6.28541C6.22172 7.37421 6.17024 7.37422 6.12553 7.37473C6.12501 7.41945 6.125 7.47093 6.125 7.53462V10.6555H7.875Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
    </div>
  );
});

const ModelNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-indigo-500 text-white shadow-md">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                data-icon="Llm"
                aria-hidden="true"
              >
                <g id="icons/llm">
                  <path
                    id="Vector (Stroke)"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.83333 2.40625C5.04971 2.40625 4.39011 2.94431 4.20689 3.67206C4.13982 3.93846 3.91391 4.1349 3.64078 4.16432C2.94692 4.23906 2.40625 4.82766 2.40625 5.54167C2.40625 5.92943 2.56471 6.27904 2.82212 6.53129C2.94807 6.65472 3.01905 6.82365 3.01905 7C3.01905 7.17635 2.94807 7.34528 2.82212 7.46871C2.56471 7.72096 2.40625 8.07057 2.40625 8.45833C2.40625 9.03652 2.76061 9.53347 3.26651 9.74092C3.45247 9.81717 3.59324 9.97444 3.64849 10.1677C3.8841 10.9917 4.64342 11.5938 5.54167 11.5938C5.82802 11.5938 6.09916 11.533 6.34375 11.4237V9.91667C6.34375 9.31258 5.85409 8.82292 5.25 8.82292C4.88756 8.82292 4.59375 8.5291 4.59375 8.16667C4.59375 7.80423 4.88756 7.51042 5.25 7.51042C5.64385 7.51042 6.0156 7.60503 6.34375 7.77278V2.48514C6.18319 2.43393 6.01183 2.40625 5.83333 2.40625ZM7.65625 2.48514V4.08333C7.65625 4.6874 8.14592 5.17708 8.75 5.17708C9.11244 5.17708 9.40625 5.4709 9.40625 5.83333C9.40625 6.19577 9.11244 6.48958 8.75 6.48958C8.35615 6.48958 7.9844 6.39496 7.65625 6.22722V11.4237C7.90087 11.533 8.17199 11.5938 8.45833 11.5938C9.35657 11.5938 10.1159 10.9917 10.3515 10.1677C10.4068 9.97444 10.5475 9.81717 10.7335 9.74092C11.2394 9.53347 11.5938 9.03652 11.5938 8.45833C11.5938 8.07056 11.4353 7.72096 11.1779 7.46871C11.0519 7.34528 10.981 7.17635 10.981 7C10.981 6.82365 11.0519 6.65472 11.1779 6.53129C11.4353 6.27904 11.5938 5.92944 11.5938 5.54167C11.5938 4.82766 11.0531 4.23906 10.3592 4.16432C10.0861 4.1349 9.86022 3.93847 9.79315 3.67208C9.6099 2.94432 8.95027 2.40625 8.16667 2.40625C7.98817 2.40625 7.81681 2.43393 7.65625 2.48514ZM7.00001 12.565C6.56031 12.7835 6.06472 12.9062 5.54167 12.9062C4.14996 12.9062 2.96198 12.0403 2.48457 10.8188C1.65595 10.3591 1.09375 9.47501 1.09375 8.45833C1.09375 7.9213 1.2511 7.42042 1.52161 7C1.2511 6.57958 1.09375 6.0787 1.09375 5.54167C1.09375 4.30153 1.93005 3.25742 3.06973 2.94157C3.51828 1.85715 4.586 1.09375 5.83333 1.09375C6.24643 1.09375 6.64104 1.17788 7 1.33013C7.35896 1.17788 7.75357 1.09375 8.16667 1.09375C9.41399 1.09375 10.4817 1.85716 10.9303 2.94157C12.0699 3.25742 12.9062 4.30153 12.9062 5.54167C12.9062 6.07869 12.7489 6.57958 12.4784 7C12.7489 7.42043 12.9062 7.92131 12.9062 8.45833C12.9062 9.47502 12.344 10.3591 11.5154 10.8188C11.038 12.0403 9.85003 12.9062 8.45833 12.9062C7.93526 12.9062 7.4397 12.7834 7.00001 12.565Z"
                    fill="currentColor"
                  ></path>
                </g>
              </svg>
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
    </div>
  );
});

const KnowledgebaseNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-emerald-500 text-white shadow-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                data-icon="KnowledgeRetrieval"
                aria-hidden="true"
              >
                <g id="icons/knowledge-retrieval">
                  <path
                    id="Vector (Stroke)"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.78528 2.62834C3.78527 2.62834 3.78528 2.62834 3.78528 2.62834L8 3.56494L12.2147 2.62834C13.5158 2.33921 14.75 3.32924 14.75 4.66206V11.2637C14.75 12.2401 14.0718 13.0855 13.1187 13.2974L8.1627 14.3987C8.05554 14.4225 7.94446 14.4225 7.8373 14.3987L2.88139 13.2974C1.92824 13.0855 1.25 12.2401 1.25 11.2637V4.66206C1.25 3.32925 2.4842 2.33921 3.78528 2.62834ZM7.25 4.93487L3.45988 4.09262C3.09558 4.01166 2.75 4.28887 2.75 4.66206V11.2637C2.75 11.537 2.93986 11.7738 3.20679 11.8331C3.20678 11.8331 3.20681 11.8331 3.20679 11.8331L7.25 12.7316V4.93487ZM8.75 12.7316L12.7932 11.8331C13.0601 11.7738 13.25 11.537 13.25 11.2637V4.66206C13.25 4.28887 12.9044 4.01165 12.5401 4.09262L8.75 4.93487V12.7316Z"
                    fill="currentColor"
                  ></path>
                </g>
              </svg>
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
    </div>
  );
});

const EndNode = memo(({ data, isConnectable, selected }) => {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          backgroundColor: '#296dff',
          height: '12px',
          width: '2px',
          borderRadius: '1px',
        }}
      />
      <div
        className={`flex rounded-2xl border-[2px] ${selected ? 'border-blue-500' : 'border-transparent'}`}
      >
        <div className="group relative w-[240px] rounded-[15px] border border-transparent bg-white pb-1 shadow-xs hover:shadow-lg">
          <div className="flex items-center rounded-t-2xl px-3 pt-3 pb-2">
            <div className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-lg border-[0.5px] border-white/2 bg-amber-500 text-white shadow-md">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                data-icon="Answer"
                aria-hidden="true"
              >
                <g id="icons/answer">
                  <path
                    id="Vector (Stroke)"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.50114 1.67701L10.5011 1.677C11.5079 1.677 12.3241 2.49311 12.3241 3.49992V9.35414C12.3241 10.3609 11.5079 11.177 10.5012 11.1771H8.9954L7.41734 12.4845C7.17339 12.6866 6.81987 12.6856 6.57708 12.4821L5.02026 11.1771H3.50114C2.49436 11.1771 1.67822 10.3608 1.67822 9.35414V3.49993C1.67822 2.49316 2.49437 1.67701 3.50114 1.67701ZM10.5011 2.9895L3.50114 2.98951C3.21924 2.98951 2.99072 3.21803 2.99072 3.49993V9.35414C2.99072 9.63601 3.21926 9.86455 3.50114 9.86455H5.04675C5.33794 9.86455 5.61984 9.96705 5.84302 10.1541L7.00112 11.1249L8.17831 10.1496C8.40069 9.96537 8.68041 9.86455 8.96916 9.86455H10.5011C10.5011 9.86455 10.5011 9.86455 10.5011 9.86455C10.783 9.8645 11.0116 9.63592 11.0116 9.35414V3.49992C11.0116 3.21806 10.7831 2.9895 10.5011 2.9895ZM9.06809 4.93171C9.32437 5.18799 9.32437 5.60351 9.06809 5.85979L7.02642 7.90146C6.77014 8.15774 6.35464 8.15774 6.09835 7.90146L5.22333 7.02646C4.96704 6.77019 4.96704 6.35467 5.22332 6.09839C5.4796 5.8421 5.89511 5.8421 6.15139 6.09837L6.56238 6.50935L8.14001 4.93171C8.3963 4.67543 8.81181 4.67543 9.06809 4.93171Z"
                    fill="currentColor"
                  ></path>
                </g>
              </svg>
            </div>
            <div className="mr-1 flex grow items-center truncate">{data.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

interface WorkflowEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const WorkflowCanvas = ({ initialNodes, initialEdges }: WorkflowEditorProps) => {
  return (
    <div className="size-full">
      <FlowChart
        nodeTypes={{
          start: StartNode,
          model: ModelNode,
          knowledgebase: KnowledgebaseNode,
          end: EndNode,
        }}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
      />
    </div>
  );
};

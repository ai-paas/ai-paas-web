import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BreadCrumb, Button, Select, Tabs, type SelectSingleValue } from '@innogrid/ui';
import {
  useGetCatalogDetail,
  useGetCatalogReadme,
  useGetCatalogValues,
} from '@/hooks/service/catalog';
import { formatDateTime } from '@/util/date';
import styles from '../../../inframonitor.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CopyIcon = ({ copied }: { copied?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={copied ? '#2f9e44' : '#495057'}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

type OptionType = { text: string; value: string };

export default function CatalogDetailPage() {
  const { chartName } = useParams<{ chartName: string }>();
  const navigate = useNavigate();
  const repoName = 'chart-museum-external';
  const [selectedVersionValue, setSelectedVersionValue] = useState<string>();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [copyStatus, setCopyStatus] = useState<{
    key: string;
    status: 'success' | 'error';
    message?: string;
  } | null>(null);

  // 선택된 버전 또는 초기 버전 사용
  const version = selectedVersionValue;

  const { catalogDetail, isPending, isError, error } = useGetCatalogDetail(
    repoName,
    chartName || '',
    version
  );

  const {
    data: readmeData,
    isPending: isReadmePending,
    isError: isReadmeError,
    error: readmeError,
  } = useGetCatalogReadme(repoName, chartName || '', version);

  const {
    data: valuesData,
    isPending: isValuesPending,
    isError: isValuesError,
    error: valuesError,
  } = useGetCatalogValues(repoName, chartName || '', version);

  const handleCopyContent = useCallback(async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus({ key, status: 'success' });
      setTimeout(() => {
        setCopyStatus((prev) => (prev?.key === key ? null : prev));
      }, 2000);
    } catch (err) {
      setCopyStatus({
        key,
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
      setTimeout(() => {
        setCopyStatus((prev) => (prev?.key === key ? null : prev));
      }, 3000);
    }
  }, []);

  const renderDocumentSection = ({
    title,
    description,
    data,
    fallbackContent,
    fallbackVersion,
    isPending,
    isError,
    error,
    loadingMessage,
    emptyMessage,
    errorMessage,
    language,
    copyKey,
  }: {
    title: string;
    description: string;
    data?: { version?: string; content: string };
    fallbackContent?: string;
    fallbackVersion?: string;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    loadingMessage: string;
    emptyMessage: string;
    errorMessage: string;
    language: string;
    copyKey: string;
  }) => {
    const displayVersion = data?.version || fallbackVersion;

    let message: string | null = null;
    let bodyContent: string | null = null;
    if (isPending) {
      message = loadingMessage;
    } else if (isError) {
      const details = error instanceof Error ? error.message : error ? String(error) : undefined;
      message = details ? `${errorMessage}\n${details}` : errorMessage;
    } else {
      const resolvedContent = data?.content || fallbackContent || '';
      if (resolvedContent) {
        bodyContent = resolvedContent;
      } else {
        message = emptyMessage;
      }
    }

    const isCopied = copyStatus?.key === copyKey && copyStatus.status === 'success';
    const isCopyError = copyStatus?.key === copyKey && copyStatus.status === 'error';

    return (
      <div
        style={{
          padding: '24px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '16px',
            minHeight: '120px',
            color: '#343a40',
            fontFamily: 'inherit',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              paddingRight: '32px',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '16px', fontFamily: 'inherit' }}>
              {title}
            </span>
            {displayVersion && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#f1f3f5',
                  color: '#495057',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              >
                {displayVersion}
              </span>
            )}
            {bodyContent && (
              <button
                type="button"
                onClick={() => handleCopyContent(bodyContent, copyKey)}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: `1px solid ${isCopied ? '#2f9e44' : isCopyError ? '#e03131' : '#ced4da'}`,
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                aria-label={`${title} 복사`}
                title={isCopied ? '복사 완료' : '클립보드로 복사'}
              >
                <CopyIcon copied={isCopied} />
              </button>
            )}
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#8692a6',
              fontFamily: 'inherit',
              marginBottom: '12px',
            }}
          >
            {description}
          </div>

          {isCopyError && (
            <div style={{ fontSize: '11px', color: '#e03131', marginBottom: '12px' }}>
              복사에 실패했습니다.
              {copyStatus.message ? ` (${copyStatus.message})` : ''}
            </div>
          )}

          {message ? (
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{message}</div>
          ) : (
            <SyntaxHighlighter
              language={language}
              style={syntaxStyle}
              customStyle={{
                margin: 0,
                background: 'transparent',
                padding: 0,
                fontSize: '14px',
                lineHeight: '1.6',
              }}
              wrapLines
              wrapLongLines
            >
              {bodyContent ?? ''}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    );
  };

  const handleVersionChange = (option: SelectSingleValue<OptionType>) => {
    if (option) {
      setSelectedVersionValue(option.value);
      // 버전 변경 시 queryKey가 변경되어 자동으로 API 재호출됨
    }
  };

  const handleDeploy = () => {
    alert('배포 기능은 준비 중입니다.');
  };

  const breadcrumbItems = [
    { label: '인프라 모니터' },
    { label: '애플리케이션' },
    { label: '카탈로그', path: '/infra-management/application/catalog' },
    { label: '카탈로그 상세' },
  ];

  // versionOptions를 useMemo로 메모이제이션 (versionHistory는 객체 배열로 고정)
  const versionOptions: OptionType[] = useMemo(() => {
    if (!catalogDetail?.versionHistory || !Array.isArray(catalogDetail.versionHistory)) {
      return [];
    }

    return catalogDetail.versionHistory
      .map((item) => item.version)
      .filter((version): version is string => Boolean(version))
      .map((version) => ({
        text: `버전 정보 : ${version}`,
        value: version,
      }));
  }, [catalogDetail]);

  // 초기 버전 설정 (데이터가 로드되고 선택된 버전이 없을 때)
  useEffect(() => {
    if (!catalogDetail || versionOptions.length === 0) return;

    if (!selectedVersionValue) {
      const currentVersionOption =
        versionOptions.find((opt) => opt.value === catalogDetail.version) || versionOptions[0];
      setSelectedVersionValue(currentVersionOption.value);
    } else if (!versionOptions.some((opt) => opt.value === selectedVersionValue)) {
      setSelectedVersionValue(versionOptions[0].value);
    }
  }, [catalogDetail, versionOptions, selectedVersionValue]);

  const selectedVersionOption = useMemo(() => {
    if (!versionOptions.length) return undefined;
    return (
      versionOptions.find((option) => option.value === selectedVersionValue) || versionOptions[0]
    );
  }, [versionOptions, selectedVersionValue]);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  if (isPending) {
    return (
      <main>
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
        <div className="page-title-box">
          <h2 className="page-title">카탈로그 상세</h2>
        </div>
        <div className="page-content">
          <div style={{ padding: '24px', textAlign: 'center' }}>로딩 중...</div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main>
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
        <div className="page-title-box">
          <h2 className="page-title">카탈로그 상세</h2>
        </div>
        <div className="page-content">
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
            {error && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                {error instanceof Error ? error.message : String(error)}
              </div>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              Chart Name: {chartName}, Repo Name: {repoName}
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              API URL: /api/v1/any-cloud/catalog/{repoName}/{chartName}/detail
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!catalogDetail) {
    return (
      <main>
        <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
        <div className="page-title-box">
          <h2 className="page-title">카탈로그 상세</h2>
        </div>
        <div className="page-content">
          <div style={{ padding: '24px', textAlign: 'center' }}>데이터가 없습니다.</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BreadCrumb items={breadcrumbItems} onNavigate={navigate} />
      <div className="page-title-box">
        <h2 className="page-title">카탈로그 상세</h2>
        <div className="page-toolBox">
          <div className="page-toolBox-btns">
            <div className="page-input_item-box" style={{ marginBottom: 0, alignItems: 'center' }}>
              <div
                className="page-input_item-data"
                style={{ flexDirection: 'row', gap: '12px', alignItems: 'center' }}
              >
                <div style={{ width: '200px' }}>
                  <Select
                    options={versionOptions}
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => option.value}
                    value={selectedVersionOption}
                    onChange={handleVersionChange}
                    size="small"
                  />
                </div>
                <Button onClick={handleDeploy} color="focus" size="medium">
                  배포
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-content page-pb-40">
        {/* 카탈로그 설명 영역 (전체 너비) */}
        <div className={styles.catalogDetailHeader}>
          <div className={styles.catalogDetailInfo}>
            <div className={styles.catalogImg}>
              {catalogDetail.icon ? (
                <img
                  src={catalogDetail.icon}
                  alt={catalogDetail.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    color: '#999',
                    fontSize: '12px',
                  }}
                >
                  No Image
                </div>
              )}
            </div>
            <div className={styles.catalogDetailDesc}>
              <p>{catalogDetail.description}</p>
            </div>
          </div>
        </div>

        {/* 상세 정보 영역 (2컬럼) */}
        <h3 className="page-detail-title">상세 정보</h3>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 왼쪽 컬럼 */}
          <div style={{ flex: 1 }}>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                <li>
                  <div className="page-detail_item-name">이름</div>
                  <div className="page-detail_item-data">{catalogDetail.name}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">애플리케이션 버전</div>
                  <div className="page-detail_item-data">{catalogDetail.appVersion}</div>
                </li>
                <li>
                  <div className="page-detail_item-name">생성일시</div>
                  <div className="page-detail_item-data">
                    {formatDateTime(catalogDetail.created)}
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">최근 업데이트</div>
                  <div className="page-detail_item-data">
                    {catalogDetail.updated
                      ? formatDateTime(catalogDetail.updated)
                      : formatDateTime(catalogDetail.created)}
                  </div>
                </li>
                <li>
                  <div className="page-detail_item-name">레포지토리</div>
                  <div className="page-detail_item-data">
                    {catalogDetail.repositoryName}/{catalogDetail.chartName}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* 오른쪽 컬럼 */}
          <div style={{ flex: 1 }}>
            <div className="page-detail-list-box">
              <ul className="page-detail-list">
                {catalogDetail.maintainers && catalogDetail.maintainers.length > 0 && (
                  <li>
                    <div className="page-detail_item-name">차트 관리자</div>
                    <div
                      className="page-detail_item-data"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                      }}
                    >
                      {catalogDetail.maintainers.map((maintainer, idx) => (
                        <div
                          key={idx}
                          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                          <div>{maintainer.name}</div>
                          <div>{maintainer.email}</div>
                        </div>
                      ))}
                    </div>
                  </li>
                )}
                {catalogDetail.keywords && catalogDetail.keywords.length > 0 && (
                  <li>
                    <div className="page-detail_item-name">키워드</div>
                    <div className="page-detail_item-data">{catalogDetail.keywords.join(', ')}</div>
                  </li>
                )}
                {catalogDetail.source &&
                  Array.isArray(catalogDetail.source) &&
                  catalogDetail.source.length > 0 && (
                    <li>
                      <div className="page-detail_item-name">소스 정보</div>
                      <div className="page-detail_item-data">
                        {catalogDetail.source.map((source, idx) => (
                          <div key={idx}>
                            <a
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="page-detail_item-data-link"
                            >
                              {source}
                            </a>
                          </div>
                        ))}
                      </div>
                    </li>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content page-content-detail">
        <div className="page-tabsBox">
          <Tabs
            labels={['README', 'Values']}
            value={String(activeTabIndex)}
            onValueChange={(index) => handleTabChange(index)}
            components={[
              <div key="readme" className="tabs-Content">
                {renderDocumentSection({
                  title: 'README',
                  description: 'Documentation and usage instructions for this chart',
                  data: readmeData,
                  fallbackContent: catalogDetail.readme,
                  fallbackVersion: catalogDetail.version,
                  isPending: isReadmePending,
                  isError: isReadmeError,
                  error: readmeError,
                  loadingMessage: 'README 로딩 중...',
                  emptyMessage: 'README 내용이 없습니다.',
                  errorMessage: 'README를 불러오는 중 문제가 발생했습니다.',
                  language: 'markdown',
                  copyKey: 'readme',
                })}
              </div>,
              <div key="values" className="tabs-Content">
                {renderDocumentSection({
                  title: 'Values',
                  description: 'Configuration values for this chart',
                  data: valuesData,
                  fallbackContent: catalogDetail.values,
                  fallbackVersion: catalogDetail.version,
                  isPending: isValuesPending,
                  isError: isValuesError,
                  error: valuesError,
                  loadingMessage: 'Values 로딩 중...',
                  emptyMessage: 'Values 내용이 없습니다.',
                  errorMessage: 'Values를 불러오는 중 문제가 발생했습니다.',
                  language: 'yaml',
                  copyKey: 'values',
                })}
              </div>,
            ]}
          />
        </div>
      </div>
    </main>
  );
}

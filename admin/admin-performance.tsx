import { getRenderPageProps, HtmlVar, NotificationColor, NotificationMessage, RefProps } from 'lupine.js';

export const AdminPerformancePage = () => {
  const fetchData = async () => {
    const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/performance/data');
    return data.json;
  };
  const onRefresh = async () => {
    const data = await fetchData();
    console.log(data);
    dom.value = <pre>{JSON.stringify(data, null, 2)}</pre>;
  };

  const onRefreshCache = async () => {
    const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/performance/refresh-cache');
    const dataResponse = await response.json;
    console.log('AdminRelease', dataResponse);
    if (!dataResponse || dataResponse.status !== 'ok') {
      NotificationMessage.sendMessage(dataResponse.message || 'Failed to refresh cache', NotificationColor.Error);
      return;
    }
    dom.value = <pre>{JSON.stringify(dataResponse, null, 2)}</pre>;
    NotificationMessage.sendMessage('Cache refreshed successfully', NotificationColor.Success);
  };

  const ref: RefProps = {
    onLoad: async () => {
      onRefresh();
    },
  };
  const dom = HtmlVar('');
  return (
    <div ref={ref}>
      <button onClick={onRefresh} class='button-base'>
        Refresh
      </button>
      <button onClick={onRefreshCache} class='button-base'>
        Refresh Cache
      </button>
      {dom.node}
    </div>
  );
};

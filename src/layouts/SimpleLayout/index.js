import DocumentTitle from 'react-document-title';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
const query = {
  'screen-xs': {
    maxWidth: 575
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199
  },
  'screen-xl': {
    minWidth: 1200
  }
};

export default props => {
  const { children, pageTitle } = props;
  return (
    <DocumentTitle title={pageTitle}>
      <ContainerQuery query={query}>
        {params =>(
          <div className={classNames(params)}>{children}</div>
        )}
      </ContainerQuery>
    </DocumentTitle>
  );
};

import React from 'react';
import Link from 'umi/link';
import Exception from '@/components/Exception';

export default ({history,location,match}, props) => (
    <Exception type="404" style={{ minHeight: 500, height: '80%' }} linkElement={Link} />
);

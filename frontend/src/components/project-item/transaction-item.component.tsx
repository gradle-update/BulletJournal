import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { Avatar, Popconfirm, Popover, Tooltip, Tag } from 'antd';
import {
  DeleteTwoTone,
  MoreOutlined,
  AccountBookOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { deleteTransaction } from '../../features/transactions/actions';
import { Label, stringToRGB } from '../../features/label/interface';
import { Transaction } from '../../features/transactions/interface';
import './project-item.styles.less';
import moment from 'moment-timezone';
import { IState } from '../../store';
import {ProjectItemUIType, ProjectType} from '../../features/project/constants';
//import modal
import MoveProjectItem from '../modals/move-project-item.component';
import EditTransaction from '../modals/edit-transaction.component';
import {
  getIcon,
  getItemIcon,
} from '../draggable-labels/draggable-label-list.component';
import { setSelectedLabel } from '../../features/label/actions';
import {User} from "../../features/group/interface";

const LocaleCurrency = require('locale-currency'); //currency code

type TransactionProps = {
  inProject: boolean;
  currency: string;
  setSelectedLabel: (label: Label) => void;
  showModal?: (user: User) => void;
};

type TransactionManageProps = {
  inModal?: boolean;
  transaction: Transaction;
  type: ProjectItemUIType;
  deleteTransaction: (transactionId: number, type: ProjectItemUIType) => void;
};

const ManageTransaction: React.FC<TransactionManageProps> = (props) => {
  const { transaction, deleteTransaction, inModal, type } = props;

  if (inModal === true) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Popconfirm
              title='Are you sure?'
              okText='Yes'
              cancelText='No'
              className='group-setting'
              placement='bottom'
              onConfirm={() => deleteTransaction(transaction.id, type)}
          >
            <div className='popover-control-item'>
              <span>Delete</span>
              <DeleteTwoTone twoToneColor='#f5222d' />
            </div>
          </Popconfirm>
        </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <EditTransaction transaction={transaction} mode='div' />
      <MoveProjectItem
        type={ProjectType.LEDGER}
        projectItemId={transaction.id}
        mode='div'
      />
      <Popconfirm
        title='Are you sure?'
        okText='Yes'
        cancelText='No'
        className='group-setting'
        placement='bottom'
        onConfirm={() => deleteTransaction(transaction.id, type)}
      >
        <div className='popover-control-item'>
          <span>Delete</span>
          <DeleteTwoTone twoToneColor='#f5222d' />
        </div>
      </Popconfirm>
    </div>
  );
};

const TransactionItem: React.FC<TransactionProps & TransactionManageProps> = (props) => {
  // hook history in router
  const history = useHistory();
  // jump to label searching page by label click
  const toLabelSearching = (label: Label) => {
    props.setSelectedLabel(label);
    history.push('/labels/search');
  };
  const { transaction, deleteTransaction, inModal, inProject, showModal, type } = props;

  const getPaymentDateTime = () => {
    if (!transaction.date) {
      return null;
    }

    return (
      <Tooltip
        title={moment
          .tz(
            `${transaction.date} ${
              transaction.time ? transaction.time : '00:00'
            }`,
            transaction.timezone
          )
          .fromNow()}
        placement={'bottom'}
      >
        <div className='project-item-time'>
          {transaction.date} {transaction.time}
        </div>
      </Tooltip>
    );
  };

  const getTransactionInfo = (transaction: Transaction) => {
    const amount = `${transaction.amount} ${
      props.currency ? LocaleCurrency.getCurrency(props.currency) : ''
    }`;
    switch (transaction.transactionType) {
      case 0:
        return (
          <Tooltip title={`Income ${amount}`}>
            <span className='transaction-item-income'>
              <DollarOutlined /> {transaction.amount}
            </span>
          </Tooltip>
        );
      case 1:
        return (
          <Tooltip title={`Expense ${amount}`}>
            <span className='transaction-item-expense'>
              <DollarOutlined /> {transaction.amount}
            </span>
          </Tooltip>
        );
    }

    return null;
  };

  const getAvatar = (user: User) => {
    if (!inProject || !showModal) return <span
        className='user-avatar-icon'><Avatar src={user.avatar} size='small' /></span>;
    return (
        <span
            className='user-avatar-icon'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              showModal(user);
            }}
        >
        <Avatar src={user.avatar} size='small' style={{ cursor: 'pointer' }} />
      </span>
    );
  };

  return (
    <div className='project-item'>
      <div className='project-item-content'>
        <Link to={`/transaction/${transaction.id}`}>
          <h3 className='project-item-name'>
              <Tooltip
                  title={`Created by ${transaction.owner.alias}`}
              >
                  {getAvatar(transaction.owner)}
              </Tooltip>
              {' '}{getItemIcon(transaction, <AccountBookOutlined />)}&nbsp;
            {transaction.name}
          </h3>
        </Link>
        <div className='project-item-subs'>
          <div className='project-item-labels'>
            {transaction.labels &&
              transaction.labels.map((label) => {
                return (
                  <Tag
                    key={`label${label.id}`}
                    className='labels'
                    onClick={() => toLabelSearching(label)}
                    color={stringToRGB(label.value)}
                    style={{ cursor: 'pointer', borderRadius: 10 }}
                  >
                    <span>
                      {getIcon(label.icon)} &nbsp;
                      {label.value}
                    </span>
                  </Tag>
                );
              })}
          </div>
          {getPaymentDateTime()}
        </div>
      </div>

      <div className='project-control'>
        <div className='project-item-owner'>
          <Tooltip
            title={`Payer ${transaction.payer.alias}`}
          >
            {getAvatar(transaction.payer)}
          </Tooltip>
        </div>
        <div className='project-item-owner'>
          {getTransactionInfo(transaction)}
        </div>
        <Popover
          arrowPointAtCenter
          placement='rightTop'
          overlayStyle={{ width: '150px' }}
          content={
            <ManageTransaction
              transaction={transaction}
              type={type}
              deleteTransaction={deleteTransaction}
              inModal={inModal}
            />
          }
          trigger='click'
        >
          <span className='project-control-more'>
            <MoreOutlined />
          </span>
        </Popover>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => ({
  currency: state.myself.currency,
});

export default connect(mapStateToProps, {
  deleteTransaction,
  setSelectedLabel,
})(TransactionItem);

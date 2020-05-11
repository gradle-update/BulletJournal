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
import { ProjectType } from '../../features/project/constants';
//import modal
import MoveProjectItem from '../modals/move-project-item.component';
import EditTransaction from '../modals/edit-transaction.component';
import {
  getIcon,
  getItemIcon,
} from '../draggable-labels/draggable-label-list.component';
import { addSelectedLabel } from '../../features/label/actions';
import {User} from "../../features/group/interface";

const LocaleCurrency = require('locale-currency'); //currency code

type TransactionProps = {
  inProject: boolean;
  currency: string;
  aliases: any;
  addSelectedLabel: (label: Label) => void;
  showModal?: (user: User) => void;
};

type TransactionManageProps = {
  inModal?: boolean;
  transaction: Transaction;
  deleteTransaction: (transactionId: number) => void;
};

const ManageTransaction: React.FC<TransactionManageProps> = (props) => {
  const { transaction, deleteTransaction, inModal } = props;

  if (inModal === true) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Popconfirm
              title='Are you sure?'
              okText='Yes'
              cancelText='No'
              className='group-setting'
              placement='bottom'
              onConfirm={() => deleteTransaction(transaction.id)}
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
        onConfirm={() => deleteTransaction(transaction.id)}
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
    props.addSelectedLabel(label);
    history.push('/labels/search');
  };
  const { transaction, deleteTransaction, aliases, inModal, inProject, showModal } = props;

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
    if (!inProject) return <Avatar src={user.avatar} size='small' />;
    if (!showModal) return <Avatar src={user.avatar} size='small' />;
    return (
        <span
            onClick={() => {
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
            {getItemIcon(transaction, <AccountBookOutlined />)}&nbsp;
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
            title={`Created by ${
              aliases[transaction.owner]
                ? aliases[transaction.owner]
                : transaction.owner
            }`}
          >
            {getAvatar({
              accepted: true,
              avatar: transaction.ownerAvatar ? transaction.ownerAvatar : '',
              id: 0,
              name: transaction.owner ? transaction.owner : '',
              alias: transaction.owner ? transaction.owner : '',
              thumbnail: '',
            })}
          </Tooltip>
        </div>
        <div className='project-item-owner'>
          <Tooltip
            title={`Payer ${
              aliases[transaction.payer]
                ? aliases[transaction.payer]
                : transaction.payer
            }`}
          >
            {getAvatar({
              accepted: true,
              avatar: transaction.payerAvatar ? transaction.payerAvatar : '',
              id: 0,
              name: transaction.payer ? transaction.payer : '',
              alias: transaction.payer ? transaction.payer : '',
              thumbnail: '',
            })}
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
  aliases: state.system.aliases,
});

export default connect(mapStateToProps, {
  deleteTransaction,
  addSelectedLabel,
})(TransactionItem);

import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { getNote } from '../../features/notes/actions';
import { IState } from '../../store';
import { Note } from '../../features/notes/interface';
import { Tooltip, Tag, Avatar, Typography, Divider, Button } from 'antd';
import { stringToRGB } from '../../features/label/interface';
import { addSelectedLabel } from '../../features/label/actions';
import { icons } from '../../assets/icons/index';
import {
  TagOutlined,
  ShareAltOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './note-page.styles.less';

type NoteProps = {
  note: Note;
};

interface NotePageHandler {
  getNote: (noteId: number) => void;
  addSelectedLabel: () => void;
}

const NotePage: React.FC<NotePageHandler & NoteProps> = props => {
  const { note } = props;
  const { noteId } = useParams();
  const [showEditor] = useState(false);
  const history = useHistory();

  const toLabelSearching = () => {
    history.push('/labels/search');
  };

  const getIcon = (icon: string) => {
    let res = icons.filter(item => item.name === icon);
    return res.length > 0 ? res[0].icon : <TagOutlined />;
  };

  React.useEffect(() => {
    noteId && props.getNote(parseInt(noteId));
  }, []);
  return (
    <div className="note-page">
      <Tooltip placement="top" title={note.owner} className="note-avatar">
        <span>
          <Avatar size="large" src={note.ownerAvatar} />
        </span>
      </Tooltip>
      <div className="note-title">
        <div className="label-and-name">
          {note.name}
          <div className="note-labels">
            {note.labels &&
              note.labels.map(label => {
                return (
                  <Tooltip
                    placement="top"
                    title="Click to Check or Edit"
                    key={label.id}
                  >
                    <Tag
                      className="labels"
                      color={stringToRGB(label.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Button type="link" onClick={toLabelSearching}>
                        {getIcon(label.icon)} &nbsp;
                        {label.value}
                      </Button>
                    </Tag>
                  </Tooltip>
                );
              })}
          </div>
        </div>

        <div className="note-operation">
          <Tooltip title="Add Tag">
            <TagOutlined />
          </Tooltip>
          <Tooltip title="Share Note">
            <ShareAltOutlined />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined style={{ color: 'red' }} />
          </Tooltip>
        </div>
      </div>
      <div className="content-or-editor">
        {!showEditor ? <div></div> : <div></div>}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IState) => ({
  note: state.note.note
});

export default connect(mapStateToProps, { getNote, addSelectedLabel })(
  NotePage
);

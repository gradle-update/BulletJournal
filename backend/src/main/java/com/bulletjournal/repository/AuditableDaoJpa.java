package com.bulletjournal.repository;

import com.bulletjournal.controller.models.Activity;
import com.bulletjournal.controller.utils.ZonedDateTimeHelper;
import com.bulletjournal.repository.models.Project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AuditableDaoJpa {

    @Autowired
    private AuditableRepository auditableRepository;

    @Autowired
    private ProjectDaoJpa projectDaoJpa;

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void create(List<com.bulletjournal.notifications.Auditable> auditables) {
        auditables.forEach(auditable -> this.auditableRepository.save(auditable.toRepositoryAuditable()));
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public List<Activity> getHistory(Long projectId, String timezone, String startDate, String endDate,
            String requester) {
        Project project = this.projectDaoJpa.getProject(projectId, requester);
        if (project.isShared()) {
            return Collections.emptyList();
        }

        ZonedDateTime startTime = ZonedDateTimeHelper.getStartTime(startDate, null, timezone);
        ZonedDateTime endTime = ZonedDateTimeHelper.getEndTime(endDate, null, timezone);

        List<com.bulletjournal.repository.models.Auditable> auditables = this.auditableRepository.findAuditablesBetween(
                projectId, Timestamp.from(startTime.toInstant()), Timestamp.from(endTime.toInstant()));

        return auditables.stream().map(a -> a.toActivity()).collect(Collectors.toList());
    }

}

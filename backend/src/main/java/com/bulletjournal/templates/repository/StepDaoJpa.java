package com.bulletjournal.templates.repository;

import com.bulletjournal.exceptions.ResourceNotFoundException;
import com.bulletjournal.templates.repository.model.Choice;
import com.bulletjournal.templates.repository.model.Selection;
import com.bulletjournal.templates.repository.model.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class StepDaoJpa {

    private final StepRepository stepRepository;

    private final ChoiceDaoJpa choiceDaoJpa;

    private final SelectionDaoJpa selectionDaoJpa;

    @Autowired
    public StepDaoJpa(
        StepRepository stepRepository, ChoiceDaoJpa choiceDaoJpa, SelectionDaoJpa selectionDaoJpa
    ) {
        this.stepRepository = stepRepository;
        this.choiceDaoJpa = choiceDaoJpa;
        this.selectionDaoJpa = selectionDaoJpa;
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public List<Step> findAll() {
        return stepRepository.findAll();
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void save(Step step) {
        stepRepository.save(step);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public Step getById(Long stepId) {
        Step step = stepRepository.getById(stepId);
        if (step == null) {
            throw new ResourceNotFoundException("Step with id " + stepId + " doesn't exist");
        }
        return step;
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void updateChoicesForStep(Long stepId, List<Long> choicesIds) {
        Step step = this.getById(stepId);
        List<Choice> choices = choiceDaoJpa.getChoicesById(choicesIds);
        step.setChoices(choices);
        this.save(step);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public Step create(String name) {
        return stepRepository.save(new Step(name));
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void updateExcludedSelectionsForStep(List<Long> excludedSelectionIds, Long stepId) {
        Step step = this.getById(stepId);
        step.setExcludedSelections(selectionDaoJpa.getSelectionsById(
                excludedSelectionIds).stream().map(
                com.bulletjournal.templates.repository.model.Selection::getId).toArray(Long[]::new));
        this.save(step);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public com.bulletjournal.templates.controller.model.Step getStepByIdWithExcludedSelections(Long stepId) {
        Step step = getById(stepId);
        List<Selection> selections = selectionDaoJpa.getSelectionsById(Arrays.asList(step.getExcludedSelections()));
        com.bulletjournal.templates.controller.model.Step presentStep = step.toPresentationModel();
        presentStep.setExcludedSelections(selections.stream().map(Selection::toPresentationModel).collect(Collectors.toList()));
        return presentStep;
    }
}
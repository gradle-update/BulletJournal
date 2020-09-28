package com.bulletjournal.templates.repository;

import com.bulletjournal.exceptions.ResourceNotFoundException;
import com.bulletjournal.exceptions.UnAuthorizedException;
import com.bulletjournal.notifications.Event;
import com.bulletjournal.repository.ProjectRepository;
import com.bulletjournal.repository.UserDaoJpa;
import com.bulletjournal.repository.models.Project;
import com.bulletjournal.repository.models.User;
import com.bulletjournal.templates.repository.model.SelectionMetadataKeyword;
import com.bulletjournal.templates.repository.model.Category;
import com.bulletjournal.templates.controller.model.RemoveUserCategoryParams;
import com.bulletjournal.templates.repository.model.UserCategory;
import com.bulletjournal.templates.repository.model.UserCategoryKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class UserCategoryDaoJpa {
    private static Logger LOGGER = LoggerFactory.getLogger(UserCategoryDaoJpa.class);

    @Autowired
    private UserCategoryRepository userCategoryRepository;

    @Autowired
    private CategoryDaoJpa categoryDaoJpa;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SelectionMetadataKeywordDaoJpa selectionMetadataKeywordDaoJpa;

    @Autowired
    private UserDaoJpa userDaoJpa;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void save(UserCategory userCategory) {
        if (userCategory != null) {
            userCategoryRepository.save(userCategory);
        }
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public List<UserCategory> getUserCategoriesByUserName(String username) {
        User user = userDaoJpa.getByName(username);
        return userCategoryRepository.getAllByUser(user);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public UserCategory getUserCategoryByKey(UserCategoryKey userCategoryKey) {
        if (userCategoryKey == null) {
            return null;
        }
        return userCategoryRepository.getOne(userCategoryKey);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public boolean checkExist(UserCategoryKey userCategoryKey) {
        return userCategoryRepository.existsById(userCategoryKey);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void updateUserCategory(User user, Long categoryId, List<Long> selections, Long projectId) {
        Project project = this.projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException(
                "Project " + projectId + " not found"));
        List<SelectionMetadataKeyword> keywords = this.selectionMetadataKeywordDaoJpa
                .getKeywordsBySelections(selections);
        for (SelectionMetadataKeyword keyword : keywords) {
            saveUserSubscription(user, categoryId, selections, project, keyword);
        }
    }

    private void saveUserSubscription(
            User user, Long categoryId, List<Long> selections, Project project, SelectionMetadataKeyword keyword) {
        UserCategoryKey userCategoryKey = new UserCategoryKey(
                user.getId(), categoryId, keyword.getKeyword());
        UserCategory userCategory;
        if (!checkExist(userCategoryKey)) {
            userCategory = new UserCategory();
            userCategory.setSelections(selections.stream().distinct().map(Object::toString).collect(Collectors.joining(",")));
            userCategory.setCategory(this.categoryDaoJpa.getById(categoryId));
            userCategory.setUser(user);
            userCategory.setUserCategoryKey(userCategoryKey);
            userCategory.setProject(project);
            userCategory.setMetadataKeyword(keyword);
        } else {
            userCategory = getUserCategoryByKey(userCategoryKey);
            Set<String> selectionSet = userCategory.getSelectionIds()
                    .stream().map(Object::toString).collect(Collectors.toSet());
            if (selections != null) {
                selectionSet.addAll(selections.stream().map(Object::toString).collect(Collectors.toList()));
            }
            userCategory.setSelections(selectionSet);
        }
        save(userCategory);
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public List<Event> removeUserCategories(
            String requester,
            List<RemoveUserCategoryParams> RemoveUserCategoriesParams) {

        List<Event> events = new ArrayList<>();
        for (RemoveUserCategoryParams removeUserCategoryParams : RemoveUserCategoriesParams) {
            String username = removeUserCategoryParams.getUsername();
            String metadataKeyword = removeUserCategoryParams.getMetadataKeyword();

            // TODO: Need to check if authorization is needed here.
//            if (!username.equals(requester)) {
//                throw new UnAuthorizedException("UnAuthorized to remove other's subscription.");
//            }

            Long categoryId = removeUserCategoryParams.getCategoryId();
            Category category = this.categoryRepository.getById(categoryId);
            if (category == null) {
                throw new ResourceNotFoundException("Category with id " + categoryId + " doesn't exist");
            }

            User user = this.userDaoJpa.getByName(username);
            UserCategoryKey userCategoryKey = new UserCategoryKey(user.getId(), categoryId, metadataKeyword);
            UserCategory userCategory = this.userCategoryRepository.findById(userCategoryKey)
                    .orElseThrow(() -> new ResourceNotFoundException("UserCategory not found"));

            this.userCategoryRepository.delete(userCategory);

            if (!Objects.equals(requester, username)) { // do not notify on leaving group
                events.add(new Event(username, categoryId, category.getName()));
            }
        }
        return events;
    }
}

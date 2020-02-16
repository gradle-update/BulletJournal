package com.bulletjournal.controller.models;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class Projects {

    @NotNull
    private List<Project> owned = new ArrayList<>();

    @NotNull
    private List<ProjectsWithOwner> shared = new ArrayList<>();

    @NotBlank
    private String ownedProjectsEtag;

    @NotBlank
    private String sharedProjectsEtag;

    public List<Project> getOwned() {
        return owned;
    }

    public void setOwned(List<Project> owned) {
        this.owned = owned;
    }

    public List<ProjectsWithOwner> getShared() {
        return shared;
    }

    public void setShared(List<ProjectsWithOwner> shared) {
        this.shared = shared;
    }

    public String getOwnedProjectsEtag() {
        return ownedProjectsEtag;
    }

    public void setOwnedProjectsEtag(String ownedProjectsEtag) {
        this.ownedProjectsEtag = ownedProjectsEtag;
    }

    public String getSharedProjectsEtag() {
        return sharedProjectsEtag;
    }

    public void setSharedProjectsEtag(String sharedProjectsEtag) {
        this.sharedProjectsEtag = sharedProjectsEtag;
    }
}

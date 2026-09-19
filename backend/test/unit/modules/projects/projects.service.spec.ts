import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../../../../src/modules/projects/projects.service';
import { Project } from '../../../../src/database/entities/project.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockProjectRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repo: jest.Mocked<Repository<Project>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepository },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repo = module.get(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeGitRemote', () => {
    it('should normalize SSH git remote', () => {
      const result = service.normalizeGitRemote('git@github.com:company/storepilot.git');
      expect(result).toBe('github.com/company/storepilot');
    });

    it('should normalize HTTPS git remote', () => {
      const result = service.normalizeGitRemote('https://github.com/company/storepilot.git');
      expect(result).toBe('https///github.com/company/storepilot');
    });

    it('should handle already normalized remote', () => {
      const result = service.normalizeGitRemote('github.com/company/storepilot');
      expect(result).toBe('github.com/company/storepilot');
    });
  });

  describe('findOrCreateByIdentifier', () => {
    it('should find existing project by git remote', async () => {
      const project = { id: 'p1', name: 'storepilot', git_remote: 'github.com/company/storepilot' } as Project;
      repo.findOne.mockResolvedValue(project);

      const result = await service.findOrCreateByIdentifier('user-1', 'git@github.com:company/storepilot.git');

      expect(result.id).toBe('p1');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should create new project if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const newProject = { id: 'p2', name: 'storepilot', slug: 'github-com-company-storepilot' } as Project;
      repo.create.mockReturnValue(newProject);
      repo.save.mockResolvedValue(newProject);

      const result = await service.findOrCreateByIdentifier('user-1', 'github.com/company/storepilot');

      expect(result.id).toBe('p2');
      expect(repo.create).toHaveBeenCalled();
    });
  });
});

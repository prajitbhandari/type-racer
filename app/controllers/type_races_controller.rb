class TypeRacesController < ApplicationController
  # access all: [:show, :index], user: {except: [:destroy]}, company_admin: :all

  def index
    @type_race = TypeRace.last
  end

  # def show
  #   @templates = RaceTemplate.all.sample
  #   @type_race = TypeRace.create(users: [current_user])
  # end

  def show
    # debugger
    #Get template_id same as race_template_id
    @type_race = TypeRace.find(params[:id])
    @templates = RaceTemplate.all.sample
    # @templates = RaceTemplate.find_by_id(@type_race.race_templates_id)
    @user = User.find_by_id(current_user.id)
  end

  def create_or_join
    # debugger
    pending_race = TypeRace.pending.last
    pending_race.users << User.all
    if pending_race
      pending_race.update(current_user_id: current_user.id, status: "ongoing")
      redirect_to type_race_path(pending_race)
    else
      templates = RaceTemplate.all.sample
      # type_race = TypeRace.create(user_1_id: current_user.id, user_2_id: nil, race_templates_id: templates)
      redirect_to type_race_path(type_race)
    end
  end

  def update
    @type_racer = TypeRace.find(params[:id])
    respond_to do |format|
      if @type_racer.update_attribute(:text_area, type_racer_params[:text_area])
        format.json { render json: { text: @type_racer.text_area}, status: :ok}
      end
    end
  end

  private
  def  type_racer_params
    params.permit(:text_area, :wpm, :id, :status)
  end

  def time_count
    # time_count_in_seconds = 0
    10.downto(0) do |index|
      sleep 1
      # time_count_in_seconds =index
      if index > 3
        return true
      end
    end
  end
end


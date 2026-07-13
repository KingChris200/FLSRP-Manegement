const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ChannelType,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Manage staff training requests.')

        .addSubcommand(subcommand =>
            subcommand
                .setName('request')
                .setDescription('Submit a request for staff training.')

                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the request will be sent.'
                        )
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement
                        )
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('roblox-username')
                        .setDescription('Your Roblox username.')
                        .setMaxLength(50)
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('when')
                        .setDescription(
                            'When you are available for training.'
                        )
                        .setMaxLength(100)
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('timezone')
                        .setDescription('Your time zone.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Eastern Time', value: 'ET' },
                            { name: 'Central Time', value: 'CT' },
                            { name: 'Mountain Time', value: 'MT' },
                            { name: 'Pacific Time', value: 'PT' },
                            { name: 'Other', value: 'Other' }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName('whitelisted-group')
                        .setDescription(
                            'Are you in the whitelisted Roblox group?'
                        )
                        .setRequired(true)
                        .addChoices(
                            { name: 'Yes', value: 'Yes' },
                            { name: 'No', value: 'No' }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName('notes')
                        .setDescription('Optional additional information.')
                        .setMaxLength(1000)
                        .setRequired(false)
                )

                .addStringOption(option =>
                    option
                        .setName('banner')
                        .setDescription(
                            'Optional direct image URL for a banner.'
                        )
                        .setRequired(false)
                )

                .addRoleOption(option =>
                    option
                        .setName('ping')
                        .setDescription(
                            'Optional training-team role to notify.'
                        )
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const robloxUsername =
            interaction.options.getString('roblox-username');
        const when = interaction.options.getString('when');
        const timezone = interaction.options.getString('timezone');
        const whitelistedGroup =
            interaction.options.getString('whitelisted-group');
        const notes = interaction.options.getString('notes');
        const banner = interaction.options.getString('banner');
        const pingRole = interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }

        if (banner) {
            try {
                const url = new URL(banner);

                if (
                    url.protocol !== 'https:' &&
                    url.protocol !== 'http:'
                ) {
                    throw new Error('Invalid protocol');
                }
            } catch {
                return interaction.reply({
                    content:
                        '❌ Please use a valid HTTP or HTTPS banner URL.',
                    ephemeral: true,
                });
            }
        }

        const createEmbed = (status = 'pending', trainer = null) => {
            const statusSettings = {
                pending: {
                    color: 'Aqua',
                    title: '🎓 Training Request',
                    description:
                        'A new staff training request has been submitted.',
                },

                accepted: {
                    color: 'Green',
                    title: '✅ Training Request Accepted',
                    description:
                        'A trainer has accepted this training request.',
                },

                declined: {
                    color: 'Red',
                    title: '❌ Training Request Declined',
                    description:
                        'This training request has been declined.',
                },
            };

            const selected = statusSettings[status];

            const embed = new EmbedBuilder()
                .setColor(selected.color)
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL:
                        interaction.guild.iconURL({
                            dynamic: true,
                        }) || undefined,
                })
                .setTitle(selected.title)
                .setDescription(selected.description)
                .addFields(
                    {
                        name: '👤 Discord User',
                        value: `${interaction.user}`,
                        inline: false,
                    },
                    {
                        name: '🎮 Roblox Username',
                        value: `\`${robloxUsername}\``,
                        inline: false,
                    },
                    {
                        name: '🗓️ Availability',
                        value: when,
                        inline: true,
                    },
                    {
                        name: '🌎 Time Zone',
                        value: timezone,
                        inline: true,
                    },
                    {
                        name: '✅ Whitelisted Group',
                        value: whitelistedGroup,
                        inline: true,
                    }
                )
                .setFooter({
                    text: 'FLSRP Management • Training System',
                    iconURL:
                        interaction.client.user.displayAvatarURL(),
                })
                .setTimestamp();

            if (notes) {
                embed.addFields({
                    name: '📝 Additional Information',
                    value: notes,
                    inline: false,
                });
            }

            if (trainer) {
                embed.addFields({
                    name:
                        status === 'accepted'
                            ? '👨‍🏫 Accepted By'
                            : '🛡️ Reviewed By',
                    value: `${trainer}`,
                    inline: false,
                });
            }

            if (banner) {
                embed.setImage(banner);
            }

            return embed;
        };

        const createButtons = disabled =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('training-accept')
                    .setLabel('Accept')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled),

                new ButtonBuilder()
                    .setCustomId('training-decline')
                    .setLabel('Decline')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disabled)
            );

        try {
            const requestMessage = await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [createEmbed()],
                components: [createButtons(false)],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content:
                    `✅ Your training request was submitted in ${channel}.`,
                ephemeral: true,
            });

            const collector =
                requestMessage.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 7 * 24 * 60 * 60 * 1000,
                });

            collector.on('collect', async buttonInteraction => {
                const canReview =
                    buttonInteraction.member.permissions.has(
                        PermissionFlagsBits.ManageMessages
                    );

                if (!canReview) {
                    return buttonInteraction.reply({
                        content:
                            '❌ You do not have permission to review training requests.',
                        ephemeral: true,
                    });
                }

                const accepted =
                    buttonInteraction.customId === 'training-accept';

                await buttonInteraction.update({
                    embeds: [
                        createEmbed(
                            accepted ? 'accepted' : 'declined',
                            buttonInteraction.user
                        ),
                    ],
                    components: [createButtons(true)],
                });

                await buttonInteraction.followUp({
                    content: accepted
                        ? `✅ You accepted ${interaction.user}'s training request.`
                        : `❌ You declined ${interaction.user}'s training request.`,
                    ephemeral: true,
                });

                collector.stop('reviewed');
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'reviewed') return;

                try {
                    await requestMessage.edit({
                        components: [createButtons(true)],
                    });
                } catch (error) {
                    console.error(
                        'Could not disable training buttons:',
                        error
                    );
                }
            });
        } catch (error) {
            console.error('Training request error:', error);

            const response = {
                content:
                    '❌ I could not submit the training request. Check my channel permissions.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    },
};
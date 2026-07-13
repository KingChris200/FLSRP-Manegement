const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('peacetime')
        .setDescription('Enable or disable ER:LC peacetime.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the update will be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('Enable or disable peacetime.')
                .addChoices(
                    {
                        name: '🕊️ Enable',
                        value: 'enabled',
                    },
                    {
                        name: '🚨 Disable',
                        value: 'disabled',
                    }
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Optional reason for the update.')
                .setMaxLength(1000)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const status = interaction.options.getString('status');
        const reason = interaction.options.getString('reason');
        const pingRole = interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }

        const isEnabled = status === 'enabled';

        const embed = new EmbedBuilder()
            .setColor(isEnabled ? 'Aqua' : 'Red')
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({ dynamic: true }) || undefined,
            })
            .setTitle(
                isEnabled
                    ? '🕊️ Peacetime Enabled'
                    : '🚨 Peacetime Disabled'
            )
            .setDescription(
                isEnabled
                    ? 'Peacetime is now active. Criminal activity, pursuits, shootouts, and hostile roleplay are temporarily suspended.'
                    : 'Peacetime has ended. Normal roleplay may resume while following all server rules and priority restrictions.'
            )
            .addFields(
                {
                    name: '📡 Current Status',
                    value: isEnabled ? '🟢 Enabled' : '🔴 Disabled',
                    inline: true,
                },
                {
                    name: '👤 Updated By',
                    value: `${interaction.user}`,
                    inline: true,
                }
            )
            .setFooter({
                text: 'FLSRP Management',
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (reason) {
            embed.addFields({
                name: '📝 Reason',
                value: reason,
                inline: false,
            });
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content: `✅ Peacetime has been **${
                    isEnabled ? 'enabled' : 'disabled'
                }** in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Peacetime command error:', error);

            const response = {
                content:
                    '❌ I could not send the peacetime update. Check my channel permissions.',
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